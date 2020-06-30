# chisel-tunnel

[![NPM version](https://img.shields.io/npm/v/chisel-tunnel.svg)](https://npmjs.com/package/chisel-tunnel)

> Download releases of jpillora/chisel, a tool to create tcp-tunnels.

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

# Release-Notes

For release notes, see [CHANGELOG.md](CHANGELOG.md)

# Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).
