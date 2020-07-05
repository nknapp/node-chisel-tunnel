const { lookupAssets } = require("./lookup-assets");

describe("the lookup-assets function", () => {
	it("resolves the semver range across the existing versions", () => {
		expect(lookupAssets("^1.4.0").name).toMatch(/1\.6\.0/);
		expect(lookupAssets("~1.4.0").name).toMatch(/1\.4\.0/);
		expect(lookupAssets("~1.5.0").name).toMatch(/1\.5\.2/);
	});

	it("throws if no version matches the semver-range", () => {
		expect(() => lookupAssets("^10000.1.1")).toThrow("No version found for range ^10000.1.1");
	});

	it("throws if no the platform is not known", () => {
		const originalPlatform = process.platform;
		try {
			Object.defineProperty(process, "platform", {
				value: "unkown-os",
			});
			expect(() => lookupAssets("1.5.0")).toThrow('No chisel binary found for "unkown-os--x64"');
		} finally {
			Object.defineProperty(process, "platform", {
				value: originalPlatform,
			});
		}
	});
});
