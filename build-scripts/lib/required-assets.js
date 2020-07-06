const { extractVersion } = require("./github");

module.exports = { requiredAssets };

function requiredAssets(githubReleaseJson) {
	const version = extractVersion(githubReleaseJson);
	return [
		{ platform: "linux--ia32", assetName: `chisel_${version}_linux_386.gz` },
		{ platform: "linux--x64", assetName: `chisel_${version}_linux_amd64.gz` },
		{ platform: "win32--ia32", assetName: `chisel_${version}_windows_386.gz` },
		{ platform: "win32--x64", assetName: `chisel_${version}_windows_amd64.gz` },
		{ platform: "darwin--ia32", assetName: `chisel_${version}_darwin_386.gz` },
		{ platform: "darwin--x64", assetName: `chisel_${version}_darwin_amd64.gz` },
	];
}
