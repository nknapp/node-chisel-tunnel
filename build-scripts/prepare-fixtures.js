const { downloadFixtures } = require("../test-utils/utils/chisel-fixtures");

downloadFixtures().catch((error) => console.error(error.message + "\n" + error.stack));
