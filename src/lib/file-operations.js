const fs = require("fs-extra");
const stream = require("stream");
const crypto = require("crypto");
const { promisify } = require("util");
const pipeline = promisify(stream.pipeline);
const got = require("got");
const zlib = require("zlib");

module.exports = { download, gunzip, sha256 };

async function download(url, targetFile) {
	return pipeline(got.stream(url), fs.createWriteStream(targetFile));
}

async function gunzip(sourceFile, targetFile) {
	await pipeline(
		fs.createReadStream(sourceFile),
		zlib.createGunzip(),
		fs.createWriteStream(targetFile)
	);
	return targetFile;
}

async function sha256(file) {
	const hasher = new Hasher("SHA256");
	let readStream = fs.createReadStream(file);
	await pipeline(readStream, hasher);
	return hasher.hexDigest();
}

class Hasher extends stream.Writable {
	constructor(algorithm) {
		super();
		this.hash = crypto.createHash(algorithm);
	}

	_write(chunk, encoding, callback) {
		this.hash.update(chunk);
		callback();
	}

	hexDigest() {
		return this.hash.digest("hex");
	}
}
