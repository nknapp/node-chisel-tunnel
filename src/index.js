const fs = require("fs-extra");
const path = require("path");
const defaultCacheDir = path.resolve(__dirname, "..", "chisel-cache");
const { sha256, download, gunzip } = require("./lib/file-operations");

const { lookupAssets } = require("./lib/lookup-assets");

module.exports = { downloadChisel };

/**
 * Download chisel for a given range of versions
 * @param {string} semverRange
 * @param {object=} options
 * @param {string=} options.cacheDir
 * @return {Promise<string>} the downloaded chisel executable
 */
async function downloadChisel(semverRange, options) {
	const optionsWithDefaults = {
		cacheDir: defaultCacheDir,
		...options,
	};
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
	await gunzip(zippedFileName, extractedFilename);
	await fs.chmod(extractedFilename, 0o755);
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
