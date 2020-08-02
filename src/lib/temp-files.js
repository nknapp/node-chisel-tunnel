const fs = require("fs-extra");
const path = require("path");

let counter = 0;

function createTempfilename(targetFilename) {
	let base36Date = Date.now().toString(36);
	let nextCounter = counter++;
	let randomNumber = Math.floor(Math.random() * 1000);
	return targetFilename + "-tmp-" + base36Date + "-" + nextCounter + "-" + randomNumber;
}

async function cleanupTempfilesOlderThan(directory, maxAgeMilliseconds) {
	let filenames = null;
	try {
		filenames = await fs.readdir(directory);
	} catch (error) {
		// istanbul ignore if Difficult to test, trivial to implement
		if (error.code !== "ENOENT") {
			throw error;
		}
		// There is no cache, we do not have to delete old files
		return;
	}
	return Promise.all(
		filenames.map((filename) => {
			if (isTempfileOlderThan(filename, maxAgeMilliseconds)) {
				return fs.remove(path.join(directory, filename));
			}
		})
	);
}

function isTempfileOlderThan(filename, maxAgeMilliseconds) {
	const match = filename.match(/-tmp-([a-z0-9]+)-\d+-\d/);
	if (match == null) {
		return false;
	}
	const base36Date = match[1];
	const creationTimestamp = parseInt(base36Date, 36);
	const fileAge = Date.now() - creationTimestamp;
	return fileAge > maxAgeMilliseconds;
}

module.exports = {
	createTempfilename,
	cleanupTempfilesOlderThan,
};
