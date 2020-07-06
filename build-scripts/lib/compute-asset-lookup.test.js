const { computeAssetLookup } = require("./compute-asset-lookup");
const { getChisel_1_5_2_checksums } = require("../../test-utils/utils/chisel-fixtures");
const nock = require("nock");
const fs = require("fs");

describe("compute-asset-lookup", () => {
	afterEach(() => {
		nock.cleanAll();
	});

	it("converts github-release-json to an asset-lookup-form", async () => {
		const nockMock = mockChecksumsRequest();

		const releases = require("../../test-utils/fixtures/github-releases.json");
		let lookupContents = await computeAssetLookup(releases, "1.5.2");

		expect(lookupContents).toEqual({
			"1.5.2": {
				"darwin--ia32": {
					checksum: "09d3cc04fe795a9883abe23bee0ba2b011a4ed759e09dffd811f157233688be4",
					name: "chisel_1.5.2_darwin_386.gz",
					url:
						"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_darwin_386.gz",
				},
				"darwin--x64": {
					checksum: "f19bd04ee2c9271e758bc21fc681f0a08ebf441a70b3221ccf5d201d5ae70f9b",
					name: "chisel_1.5.2_darwin_amd64.gz",
					url:
						"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_darwin_amd64.gz",
				},
				"linux--ia32": {
					checksum: "90e2d1bb612d9658067799266605dff148b292dafd4f6ddff3e184a9b7998376",
					name: "chisel_1.5.2_linux_386.gz",
					url:
						"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_linux_386.gz",
				},
				"linux--x64": {
					checksum: "020e1dde294fabdc174cfec3d2405f70d462a897241582d16aff6670230acc45",
					name: "chisel_1.5.2_linux_amd64.gz",
					url:
						"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_linux_amd64.gz",
				},
				"win32--ia32": {
					checksum: "8b3dc5f7f95e60cc22e2e41bf2c000c3ab16983493bae2427b92f984147de598",
					name: "chisel_1.5.2_windows_386.gz",
					url:
						"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_windows_386.gz",
				},
				"win32--x64": {
					checksum: "d974db8d60caa7e30f7981ac82ec930295f8699fee94e72650bef5e35568bfd4",
					name: "chisel_1.5.2_windows_amd64.gz",
					url:
						"https://github.com/jpillora/chisel/releases/download/v1.5.2/chisel_1.5.2_windows_amd64.gz",
				},
			},
		});
		expect(nockMock.isDone()).toBe(true);
	});

	it("throws an error if a require platform/arch mix is not part of the checksums", async () => {
		mockChecksumsRequestWithout(/linux_386/);

		const releases = require("../../test-utils/fixtures/github-releases.json");
		await expect(() => computeAssetLookup(releases, "1.5.2")).rejects.toThrow(
			"No checksum found for asset chisel_1.5.2_linux_386.gz in release v1.5.2"
		);
	});

	it("throws an error if a require platform/arch mix is not part of the assets", async () => {
		mockChecksumsRequest();

		const releases = releasesWithoutAssetsMatching(/linux_386/);
		await expect(() => computeAssetLookup(releases, "1.5.2")).rejects.toThrow(
			'Asset "chisel_1.5.2_linux_386.gz" not found in release v1.5.2'
		);
	});
});

function mockChecksumsRequest() {
	const { fixturePath, urlOrigin, urlPath } = getChisel_1_5_2_checksums();
	return nock(urlOrigin)
		.get(urlPath)
		.reply(200, () => fs.readFileSync(fixturePath));
}

function mockChecksumsRequestWithout(removeLineReqex) {
	const { fixturePath, urlOrigin, urlPath } = getChisel_1_5_2_checksums();
	nock(urlOrigin)
		.get(urlPath)
		.reply(200, () => {
			return fs
				.readFileSync(fixturePath, "utf-8")
				.split("\n")
				.filter((line) => !line.match(removeLineReqex))
				.join("\n");
		});
}

function releasesWithoutAssetsMatching(removedAssetNameRegex) {
	const releasesJson = require("../../test-utils/fixtures/github-releases.json");
	return releasesJson.map((release) => ({
		...release,
		assets: release.assets.filter((asset) => !asset.name.match(removedAssetNameRegex)),
	}));
}
