const { sha256 } = require("./file-operations");
const fixtureFile = require.resolve("../../test/fixtures/fileHashTestFixture.txt");

describe("file-hash", () => {
	it("should compute the sha256 hash of a file", async () => {
		const hash = await sha256(fixtureFile);
		expect(hash).toEqual("fc4b5fd6816f75a7c81fc8eaa9499d6a299bd803397166e8c4cf9280b801d62c");
	});
});
