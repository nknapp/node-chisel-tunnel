const chiselTunnel = require("../");
const cp = require("child_process");

chiselTunnel.downloadChisel("~1.5.0").then((filename) => {
	cp.spawnSync(filename, ["--version"], { stdio: "inherit" });
});
