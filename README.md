# chisel-tunnel

[![NPM version](https://img.shields.io/npm/v/chisel-tunnel.svg)](https://npmjs.com/package/chisel-tunnel)

> Use jpillora/chisel to create tcp tunnels to your server.

# Installation

```
npm install chisel-tunnel
```

# Usage

The following example demonstrates how to use this module:

```js
const chiselTunnel = require("chisel-tunnel");
const cp = require("child_process");

chiselTunnel.downloadChisel("~1.5.0").then(filename => {
  cp.spawnSync(filename, ["--version"], { stdio: "inherit" });
});
```

This will generate the following output

```
1.5.2
```

# License

`chisel-tunnel` is published under the MIT-license.

See [LICENSE.md](LICENSE.md) for details.

# Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).
