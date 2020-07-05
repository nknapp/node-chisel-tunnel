declare module "chisel-tunnel" {
	export function downloadChisel(
		semverRange: string,
		options?: DownloadChiselOptions
	): Promise<string>;

	export interface DownloadChiselOptions {
		cacheDir?: string;
	}
}
