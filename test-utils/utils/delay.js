module.exports = {
	delay(millis) {
		return new Promise((resolve) => setTimeout(resolve, millis));
	},
};
