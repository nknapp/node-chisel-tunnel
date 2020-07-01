module.exports = { uniqueIndexBy, mapValues, arrayToObject };

function uniqueIndexBy(array, keyFunction) {
	const result = {};
	array.forEach((item) => {
		const key = keyFunction(item);
		if (result[key] != null) {
			throw new Error(`Duplicate key: ${key}`);
		}
		result[key] = item;
	});
	return result;
}

function mapValues(object, mapValueFunction) {
	const result = {};
	Object.keys(object).forEach((key) => {
		result[key] = mapValueFunction(object[key]);
	});
	return result;
}

function arrayToObject(array, mapToEntry) {
	const result = {};
	array.forEach((item) => {
		const entry = mapToEntry(item);
		result[entry.key] = entry.value;
	});
	return result;
}
