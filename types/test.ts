import { downloadChisel } from "chisel-tunnel";

async function simpleTest() {
	const path: string = await downloadChisel("1.6.0");
}

async function withCustomTmpDir() {
	const path: string = await downloadChisel("1.6.0", {
		cacheDir: "./tmp",
	});
}
