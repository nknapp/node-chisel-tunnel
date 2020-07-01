const semver = require("semver");
const versionsAndAssets = require("../generated/asset-lookup.json");
const availableVersions = Object.keys(versionsAndAssets);

module.exports = { lookupAssets };

function lookupAssets(semverRange) {
	const maxRequestedVersion = semver.maxSatisfying(availableVersions, semverRange);
	if (maxRequestedVersion == null) {
		throw new Error("No version found for range " + semverRange);
	}
	const versionAssets = versionsAndAssets[maxRequestedVersion];

	const arch = process.arch;
	const platform = process.platform;
	const asset = versionAssets[platform + "--" + arch];
	if (asset == null) {
		throw new Error(`No chisel binary found for "${platform}--${arch}"`);
	}

	return asset;
}
