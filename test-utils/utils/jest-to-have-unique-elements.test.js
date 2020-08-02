const { toHaveUniqueElements } = require("./jest-to-have-unique-elements");

expect.extend({ toHaveUniqueElements });

describe("The unique matcher", () => {
	it("passes if an array contains unique elements", () => {
		expect([1, 2, 3]).toHaveUniqueElements();
	});

	it("fails if an array contains duplicates", () => {
		expect([2, 2, 3]).not.toHaveUniqueElements();
	});

	it("shows the duplicates in the error message", () => {
		expect(() => {
			expect([2, 2, 3, 2, 5]).toHaveUniqueElements();
		}).toThrow(
			/Item "2" at index 1 is a duplicate of index 0\nItem "2" at index 3 is a duplicate of index 0/
		);
	});
});
