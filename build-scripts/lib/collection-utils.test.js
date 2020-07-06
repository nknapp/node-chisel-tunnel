const { uniqueIndexBy, arrayToObject } = require("./collection-utils");

describe("uniqueIndexBy", () => {
	it("creates an index-object from an array", () => {
		expect(
			uniqueIndexBy(["a", "b", "c"], (item) => {
				return "key_" + item;
			})
		).toEqual({
			key_a: "a",
			key_b: "b",
			key_c: "c",
		});
	});

	it("throws an error if keys are not unique", () => {
		expect(() =>
			uniqueIndexBy(["a", "b", "c"], () => {
				return "key";
			})
		).toThrow("Duplicate key: key");
	});
});

describe("arrayToObject", () => {
	it("convert an array to an object, mapping each item to an {key,value} object", () => {
		expect(
			arrayToObject(["a", "b", "c"], (item) => {
				return { key: "key_" + item, value: "value_" + item };
			})
		).toEqual({
			key_a: "value_a",
			key_b: "value_b",
			key_c: "value_c",
		});
	});

	it("throws an error if keys are not unique", () => {
		expect(() =>
			arrayToObject(["a", "b", "c"], () => {
				return { key: "key", value: "value" };
			})
		).toThrow("Duplicate key: key");
	});
});
