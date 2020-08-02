const { toHaveUniqueElements } = require("../../test-utils/utils/jest-to-have-unique-elements");
const { delay } = require("../../test-utils/utils/delay");

expect.extend({ toHaveUniqueElements });
const fs = require("fs-extra");
const path = require("path");
const tempDir = "test-tmp/temp-files";
const { createTempfilename, cleanupTempfilesOlderThan } = require("./temp-files");

describe("createTempfilename", () => {
	it("creates unique temporary-filenames", async () => {
		const results = [];
		for (let i = 0; i < 1000; i++) {
			results.push(createTempfilename("test"));
		}
		expect(results).toHaveUniqueElements();
	});
});

describe("cleanupTempfilesOlderThan", () => {
	beforeEach(async () => {
		await fs.remove(tempDir);
		await fs.mkdirp(tempDir);
	});

	let tempFile = null;

	beforeEach(async () => {
		const targetFilename = "cleanup-test";
		tempFile = createTempfilename(path.join(tempDir, targetFilename));
		await fs.writeFile(tempFile, "test-data");
		expect(await fs.readdir(tempDir)).toEqual([path.basename(tempFile)]);
	});

	it("removes temp files older than the threshold", async () => {
		await delay(500);
		await cleanupTempfilesOlderThan(tempDir, 250);
		expect(await fs.readdir(tempDir)).toEqual([]);
	});

	it("keeps temp files newer than the threshold", async () => {
		await delay(500);
		await cleanupTempfilesOlderThan(tempDir, 1000);
		expect(await fs.readdir(tempDir)).toEqual([path.basename(tempFile)]);
	});

	it("keeps other files, no matter how old", async () => {
		let otherFile = path.join(tempDir, "cleanup-test");
		await fs.writeFile(otherFile, "test-data");
		await delay(500);
		await cleanupTempfilesOlderThan(tempDir, 250);
		expect(await fs.readdir(tempDir)).toContain("cleanup-test");
	});
});
