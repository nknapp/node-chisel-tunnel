const fs = require("fs-extra");
const path = require("path");

const { sha256, download, gunzip } = require("./lib/file-operations");
const { lookupAssets } = require("./lib/lookup-assets");
const { createTempfilename, cleanupTempfilesOlderThan } = require("./lib/temp-files");

const defaultCacheDir = path.resolve(__dirname, "..", "chisel-cache");
const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

module.exports = { downloadChisel };

/**
 * Download chisel for a given range of versions
 * @param {string} semverRange
 * @param {object=} options
 * @param {string=} options.cacheDir
 * @param {number=} options.maxTempFileAgeMillis remove temp-files when they are older than this age in millis.
 * @return {Promise<string>} the downloaded chisel executable
 */
async function downloadChisel(semverRange, options) {
	const optionsWithDefaults = {
		cacheDir: defaultCacheDir,
		maxTempFileAgeMillis: ONE_DAY_IN_MILLISECONDS,
		...options,
	};
	await cleanupTempfilesOlderThan(
		optionsWithDefaults.cacheDir,
		optionsWithDefaults.maxTempFileAgeMillis
	);
	const asset = lookupAssets(semverRange);
	const zippedFileName = await downloadToCacheAndVerify(asset, optionsWithDefaults.cacheDir);
	return await extractFile(zippedFileName);
}

async function downloadToCacheAndVerify(asset, cacheDir) {
	const zippedFileName = path.join(cacheDir, asset.name);
	if (await needToDownload(zippedFileName, asset.checksum)) {
		await download(asset.url, zippedFileName);
	}
	await verifyChecksum(zippedFileName, asset.checksum);
	return zippedFileName;
}

async function needToDownload(zippedFileName, checksum) {
	try {
		await verifyChecksum(zippedFileName, checksum);
	} catch (error) {
		if (error.code !== "WRONG_CHECKSUM" && error.code !== "ENOENT") {
			throw error;
		}
		return true;
	}
	return false;
}

async function extractFile(zippedFileName) {
	const extractedFilename = zippedFileName.replace(/\.gz$/, "");
	const tmpFilename = createTempfilename(extractedFilename);
	try {
		await gunzip(zippedFileName, extractedFilename);
		await fs.chmod(extractedFilename, 0o755);
		await fs.rename(tmpFilename, extractedFilename);
	} catch (error) {
		await fs.remove(tmpFilename);
	}
	return extractedFilename;
}

async function verifyChecksum(file, expectedChecksum) {
	const actualChecksum = await sha256(file);
	if (actualChecksum !== expectedChecksum) {
		throw new ChecksumError({
			file,
			expected: expectedChecksum,
			actual: actualChecksum,
		});
	}
}

class ChecksumError extends Error {
	constructor({ file, expected, actual }) {
		super(
			`Checksum mismatch "${file}", expected checksum "${expected}", actual checksum "${actual}"`
		);
		this.code = "WRONG_CHECKSUM";
	}
}
