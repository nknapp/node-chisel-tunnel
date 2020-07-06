const { uniqueIndexBy, arrayToObject } = require("./collection-utils");
const { githubReleasesMatching, extractVersion, fetchChecksums } = require("./github");
const { requiredAssets } = require("./required-assets");

module.exports = { computeAssetLookup };

async function computeAssetLookup(releases, supportedVersionRange) {
	const validReleases = releases.filter(githubReleasesMatching(supportedVersionRange));
	const versionsWithAssets = await Promise.all(validReleases.map(simplifyReleaseAssets));
	return arrayToObject(versionsWithAssets, (item) => {
		return {
			key: item.releaseVersion,
			value: item.assetsByPlatform,
		};
	});
}

async function simplifyReleaseAssets(release) {
	return {
		releaseVersion: extractVersion(release),
		assetsByPlatform: await buildPlatformLookup(release),
	};
}

/**
 * @param {object} release
 * @param {string} release.tag_name
 * @param {{name: string, browser_download_url: string}[]} release.assets
 */
async function buildPlatformLookup(release) {
	const assetsByName = uniqueIndexBy(release.assets, (asset) => asset.name);
	const checkSumsByName = await fetchChecksums(release);

	const assetDetails = requiredAssets(release).map(({ platform, assetName }) => {
		const asset = getRequiredOrThrow(
			assetsByName,
			assetName,
			() => new Error(`Asset "${assetName}" not found in release ${release.tag_name}`)
		);
		const checksum = getRequiredOrThrow(
			checkSumsByName,
			assetName,
			() => new Error(`No checksum found for asset ${assetName} in release ${release.tag_name}`)
		);

		return {
			platform,
			name: asset.name,
			url: asset.browser_download_url,
			checksum,
		};
	});

	return arrayToObject(assetDetails, ({ platform, name, url, checksum }) => {
		return {
			key: platform,
			value: { name, url, checksum },
		};
	});
}

function getRequiredOrThrow(object, key, errorProvider) {
	if (object[key] == null) {
		throw errorProvider();
	}
	return object[key];
}
