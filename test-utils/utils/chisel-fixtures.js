/* istanbul ignore file */

const fs = require("fs-extra");
const got = require("got");
const path = require("path");
const { URL } = require("url");

const { promisify } = require("util");
const stream = require("stream");
const pipeline = promisify(stream.pipeline);

const fixtureDirectory = path.relative(
	".",
	path.resolve(__dirname, "..", "fixtures", "chisel", "1.5.2")
);

module.exports = {
	downloadFixtures,
	getChisel_1_5_2_checksums,
	getChisel_1_5_2_executable,
};

async function downloadFixtures() {
	await fs.mkdirp(fixtureDirectory);

	await download(getChisel_1_5_2_checksums({ ignoreMissing: true }));
	await download(getChisel_1_5_2_executable({ ignoreMissing: true }));
}

async function download({ url, uncheckedFixturePath }) {
	let downloadStream = got.stream(url);
	let writeStream = fs.createWriteStream(uncheckedFixturePath);
	try {
		console.log("starting download of " + url + " to " + uncheckedFixturePath);
		await pipeline(downloadStream, writeStream);
		console.log("done downloading " + url);
	} catch (error) {
		console.log(error.message + "\n" + error.stack);
	}
}

function getChisel_1_5_2_executable() {
	const chisel_1_5_2_urls = {
		"linux--ia32":
			"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_linux_386.gz",
		"linux--x64":
			"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_linux_amd64.gz",
		"darwin--ia32":
			"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_darwin_386.gz",
		"darwin--x64":
			"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_darwin_amd64.gz",
		"win32--ia32":
			"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_windows_386.gz",
		"win32--x64":
			"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_windows_amd64.gz",
	};

	const key = process.platform + "--" + process.arch;
	let url = chisel_1_5_2_urls[key];
	if (url == null) {
		throw new Error(
			`Could not find value for key "${key}" in ${JSON.stringify(chisel_1_5_2_urls, null, 2)}`
		);
	}
	return buildTestValuesForChiselUrl(url);
}

function getChisel_1_5_2_checksums() {
	return buildTestValuesForChiselUrl(
		"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_checksums.txt"
	);
}

function buildTestValuesForChiselUrl(url) {
	const gzFilename = url.match(/[^/]+$/)[0];
	const fixturePath = path.join(fixtureDirectory, gzFilename);
	const executableName = gzFilename.replace(/\.gz$/, "");
	const { origin, pathname } = new URL(url);
	return {
		url,
		urlOrigin: origin,
		urlPath: pathname,
		gzFilename,
		uncheckedFixturePath: fixturePath,
		get fixturePath() {
			if (fs.existsSync(fixturePath)) {
				return fixturePath;
			}
			throw new Error(
				"Fixture " +
					fixturePath +
					" does not exist. Please call `yarn pretest` before running the tests"
			);
		},
		executableName,
	};
}
