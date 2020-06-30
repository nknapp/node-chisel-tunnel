const semver = require("semver");
const path = require("path");
const fs = require("fs-extra");
const got = require("got");

const supportedVersions = ">=1.4.0";
const lookupFile = path.resolve(__dirname, "..", "generated", "versions-and-assets-lookup.json");

(async function () {
	const releases = await releaseData();

	const assetsByVersionsAndPlatform = {};
	const finishedBuilding = releases.map(async (release) => {
		const releaseVersion = semver.clean(release.tag_name);
		if (semver.satisfies(releaseVersion, supportedVersions)) {
			assetsByVersionsAndPlatform[releaseVersion] = await buildPlatformLookup(
				releaseVersion,
				release
			);
		}
	});

	await Promise.all(finishedBuilding);

	await fs.mkdirp(path.dirname(lookupFile));
	await fs.writeFile(lookupFile, JSON.stringify(assetsByVersionsAndPlatform, null, 2));
})();

async function releaseData() {
	return got("https://api.github.com/repos/jpillora/chisel/releases").json();
}

/**
 * @param {string} version
 * @param {object} release
 * @param {string} release.tag_name
 * @param {{name: string, browser_download_url: string}[]} release.assets
 */
async function buildPlatformLookup(version, release) {
	const assetsByName = uniqueIndexBy(release.assets, (asset) => asset.name);
	const checksumsResponse = await got(
		assetsByName[`chisel_${version}_checksums.txt`].browser_download_url
	);
	const checkSumsByName = {};
	checksumsResponse.body.split("\n").forEach((line) => {
		const [checksum, assetName] = line.split(/\s+/);
		checkSumsByName[assetName] = checksum;
	});

	return mapValues(assetNames(version), (assetName) => {
		const asset = assetsByName[assetName];
		if (asset == null) {
			throw new Error(`Asset "${assetName}" not found in release ${version}`);
		}

		const checksum = checkSumsByName[assetName];
		if (checkSumsByName[assetName] == null) {
			throw new Error(`No checksum found for asset ${assetName} in release ${version}`);
		}
		return {
			name: asset.name,
			url: asset.browser_download_url,
			checksum,
		};
	});
}

function uniqueIndexBy(array, keyFunction) {
	const result = {};
	array.forEach((item) => {
		const key = keyFunction(item);
		if (result[key] != null) {
			throw new Error(`Duplicate key: ${key}`);
		}
		result[key] = item;
	});
	return result;
}

function mapValues(object, mapValueFunction) {
	const result = {};
	Object.keys(object).forEach((key) => {
		result[key] = mapValueFunction(object[key]);
	});
	return result;
}

function assetNames(version) {
	return {
		"linux--ia32": `chisel_${version}_linux_386.gz`,
		"linux--x64": `chisel_${version}_linux_amd64.gz`,
		"win--ia32": `chisel_${version}_windows_386.gz`,
		"win--x64": `chisel_${version}_windows_amd64.gz`,
		"darwin--ia32": `chisel_${version}_darwin_386.gz`,
		"darwin--x64": `chisel_${version}_darwin_amd64.gz`,
	};
}
