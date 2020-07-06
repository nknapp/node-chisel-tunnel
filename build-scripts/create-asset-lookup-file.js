#!/usr/bin/env bash

const got = require("got");
const path = require("path");
const fs = require("fs-extra");
const { computeAssetLookup } = require("./lib/compute-asset-lookup");

const supportedVersions = ">=1.4.0";
const targetFile = path.resolve(__dirname, "..", "src", "generated", "asset-lookup.json");

(async function () {
	const githubReleases = await got("https://api.github.com/repos/jpillora/chisel/releases").json();
	const assetsByVersionsAndPlatform = await computeAssetLookup(githubReleases, supportedVersions);
	await fs.mkdirp(path.dirname(targetFile));
	await fs.writeFile(targetFile, JSON.stringify(assetsByVersionsAndPlatform, null, 2));
})();
