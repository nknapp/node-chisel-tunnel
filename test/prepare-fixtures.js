const { downloadFixtures } = require("./utils/chisel-fixtures");

downloadFixtures().catch((error) => console.error(error.message + "\n" + error.stack));
