module.exports = { toHaveUniqueElements };

function toHaveUniqueElements(array) {
	const duplicates = [];
	array.forEach((item, index) => {
		let firstIndex = array.indexOf(item);
		if (firstIndex < index) {
			duplicates.push(`Item "${item}" at index ${index} is a duplicate of index ${firstIndex}`);
		}
	});

	return {
		message: () => duplicates.join("\n"),
		pass: duplicates.length === 0,
	};
}
