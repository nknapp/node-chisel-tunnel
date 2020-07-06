const { sha256 } = require("./file-operations");
const fixtureFile = require.resolve("../../test-utils/fixtures/fileHashTestFixture.txt.gz");

describe("file-operations", () => {
	describe('the "sha256"', () => {
		it("should compute the sha256 hash of a file", async () => {
			const hash = await sha256(fixtureFile);
			expect(hash).toEqual("b6f0999a4f59ee8e9249300e859e6fb5ef4da65d9e643ad8e11f892a59bf6215");
		});
	});
});
