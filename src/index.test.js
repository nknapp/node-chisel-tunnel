const chiselTunnel = require("./index");
const fs = require("fs-extra");
const cp = require("child_process");
const path = require("path");
const nock = require("nock");
const { getChisel_1_5_2_executable } = require("../test-utils/utils/chisel-fixtures");
const { delay } = require("../test-utils/utils/delay");
const { createTempfilename } = require("./lib/temp-files");

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

	const cacheDir = "test-tmp-index-test";
	beforeEach(async () => {
		nockMock = nock(urlOrigin)
			.get(urlPath)
			.reply(200, () => fs.createReadStream(fixturePath));

		await fs.remove(defaultCachedir);
		await fs.remove(cacheDir);
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
				cacheDir,
			});

			expectVersion1_5_2(filename);
			expect(nockMock.isDone()).toBe(true);
			expectToBeChisel_1_5_2_inDirectory(filename, cacheDir);
		});
	});

	it("removes old temp-files", async () => {
		await fs.mkdirp(cacheDir);

		const targetFilename = path.join(cacheDir, "test-file");
		const tempFilename = createTempfilename(targetFilename);
		await fs.writeFile(tempFilename, "test-data");
		await fs.writeFile(targetFilename, "test-data");
		await delay(500);
		let filename = await chiselTunnel.downloadChisel("~1.5.0", {
			cacheDir,
			maxTempFileAgeMillis: 250,
		});

		expect(await fs.readdir(cacheDir)).toEqual([
			path.basename(filename),
			path.basename(filename) + ".gz",
			"test-file",
		]);
	});

	it("succeeds if tunnel is executed at the same time while downloading", async () => {
		const filename = await chiselTunnel.downloadChisel("~1.5.0");
		const secondDownloadPromise = chiselTunnel.downloadChisel("~1.5.0");
		const server = cp.spawn(filename, ["server", "-p", "8123"]);
		try {
			await delay(500);
		} finally {
			server.kill("SIGKILL");
		}
		await secondDownloadPromise;
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
