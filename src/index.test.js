const chiselTunnel = require("./index");
const fs = require("fs-extra");
const cp = require("child_process");

describe("the chisel-tunnel", () => {
	beforeEach(async () => {
		await fs.remove("tmp");
	});

	it("should download a chisel binary by version range", async () => {
		let filename = await chiselTunnel.downloadChisel("~1.5.0");

		const { stdout } = cp.spawnSync(filename, ["--version"], { encoding: "utf-8" });
		expect(stdout.trim()).toEqual("1.5.2");
	});
});
