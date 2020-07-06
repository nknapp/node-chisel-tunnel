module.exports = { uniqueIndexBy, arrayToObject };

function uniqueIndexBy(array, keyFunction) {
	return arrayToObject(array, (item) => {
		return {
			key: keyFunction(item),
			value: item,
		};
	});
}

function arrayToObject(array, mapToEntry) {
	const result = {};
	array.forEach((item) => {
		const entry = mapToEntry(item);
		if (result[entry.key] != null) {
			throw new Error(`Duplicate key: ${entry.key}`);
		}
		result[entry.key] = entry.value;
	});
	return result;
}
