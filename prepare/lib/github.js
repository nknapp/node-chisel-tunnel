const { arrayToObject } = require("./collection-utils");
const semver = require("semver");
const got = require("got");

module.exports = { extractVersion, githubReleasesMatching, fetchChecksums };

function githubReleasesMatching(supportedVersionRange) {
	return (release) => semver.satisfies(extractVersion(release), supportedVersionRange);
}

function extractVersion(githubRelease) {
	return semver.clean(githubRelease.tag_name);
}

async function fetchChecksums(release) {
	const checksumAsset = release.assets.find(isChecksumAsset);
	const checksums = await got(checksumAsset.browser_download_url).text();

	return arrayToObject(checksums.split("\n"), (line) => {
		const [checksum, assetName] = line.split(/\s+/);
		return {
			key: assetName,
			value: checksum,
		};
	});
}

function isChecksumAsset(asset) {
	return asset.name.match(/^chisel_\d+\.\d+\.\d+_checksums.txt$/);
}
