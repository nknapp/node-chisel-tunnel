const chiselTunnel = require("./index");
const fs = require("fs-extra");
const cp = require("child_process");
const path = require("path");
const nock = require("nock");
const { getChisel_1_5_2_executable } = require("../test/utils/chisel-fixtures");

const defaultCachedir = "chisel-cache";
const {
	urlOrigin,
	urlPath,
	fixturePath,
	executableName,
	gzFilename,
} = getChisel_1_5_2_executable();

describe("the chisel-tunnel", () => {
	let nockMock;

	beforeEach(async () => {
		nockMock = nock(urlOrigin)
			.get(urlPath)
			.reply(200, () => fs.createReadStream(fixturePath));

		await fs.remove(defaultCachedir);
		await fs.remove("testtmp");
	});

	afterEach(() => {
		nock.cleanAll();
	});

	describe("downloads a chisel binary by version range", () => {
		it("to the default cache-directory", async () => {
			let filename = await chiselTunnel.downloadChisel("~1.5.0");
			expectVersion1_5_2(filename);
			expect(nockMock.isDone()).toBe(true);
			expectToBeChisel_1_5_2_inDirectory(filename, defaultCachedir);
		});

		it("to the specified custom temp-directory", async () => {
			let filename = await chiselTunnel.downloadChisel("~1.5.0", {
				cacheDir: "./testtmp",
			});

			expectVersion1_5_2(filename);
			expect(nockMock.isDone()).toBe(true);
			expectToBeChisel_1_5_2_inDirectory(filename, "testtmp");
		});
	});

	it("if a valid file exists in the cache, it should not be downloaded again", async () => {
		const existingChisel = path.join(defaultCachedir, gzFilename);
		await fs.copy(fixturePath, existingChisel);

		let filename = await chiselTunnel.downloadChisel("~1.5.0");

		expectVersion1_5_2(filename);
		expect(nockMock.isDone()).toBe(false);
		expectToBeChisel_1_5_2_inDirectory(filename, defaultCachedir);
	});

	it("if an invalid file exists in the cache, it should be downloaded again ", async () => {
		const existingChisel = path.join(defaultCachedir, gzFilename);
		await fs.mkdirp(defaultCachedir);
		await fs.writeFile(existingChisel, "invalid file contents");

		let filename = await chiselTunnel.downloadChisel("~1.5.0");

		expectVersion1_5_2(filename);
		expect(nockMock.isDone()).toBe(true);
		expectToBeChisel_1_5_2_inDirectory(filename, defaultCachedir);
	});

	it("if the downloaded file is invalid, an error is throw ", async () => {
		nock.cleanAll();
		nock(urlOrigin).get(urlPath).reply(200, "invalid file contents");

		await expect(() => chiselTunnel.downloadChisel("~1.5.0")).rejects.toThrow(/Checksum mismatch/);

		expect(nockMock.isDone()).toBe(true);
	});

	it("if a directory exists in the cache instead of a file, an error is thrown", async () => {
		const existingChisel = path.join(defaultCachedir, gzFilename);
		await fs.mkdirp(existingChisel);

		await expect(() => chiselTunnel.downloadChisel("~1.5.0")).rejects.toThrow(/EISDIR/);

		expect(nockMock.isDone()).toBe(false);
	});

	it("throws an error if the requested version-range is empty", async () => {
		await expect(() => chiselTunnel.downloadChisel("0.1.1")).rejects.toThrow(
			"No version found for range 0.1.1"
		);
	});
});

function expectVersion1_5_2(filename) {
	const { stdout } = cp.spawnSync(filename, ["--version"], { encoding: "utf-8" });
	expect(stdout.trim()).toEqual("1.5.2");
}

function expectToBeChisel_1_5_2_inDirectory(filename, directory) {
	expect(path.relative(".", filename)).toEqual(path.join(directory, executableName));
}
