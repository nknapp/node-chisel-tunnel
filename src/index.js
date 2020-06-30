const fs = require("fs-extra");
const path = require("path");
const tmpDir = path.resolve(__dirname, "..", "tmp");
const { sha256, download, gunzip } = require("./lib/file-operations");

const { assetLookup } = require("./asset-lookup");

module.exports = { downloadChisel };

async function downloadChisel(semverRange) {
	const asset = assetLookup(semverRange);
	const zippedFileName = path.join(tmpDir, asset.name);

	try {
		await verifyChecksum(zippedFileName, asset.checksum);
	} catch (error) {
		if (error.code !== "WRONG_CHECKSUM" && error.code !== "ENOENT") {
			throw error;
		}
		await fs.mkdirp(tmpDir);
		await download(asset.url, zippedFileName);
	}
	await verifyChecksum(zippedFileName, asset.checksum);

	const unzippedFileName = zippedFileName.replace(/\.gz$/, "");
	await gunzip(zippedFileName, unzippedFileName);
	await fs.chmod(unzippedFileName, 0o755);
	return unzippedFileName;
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
