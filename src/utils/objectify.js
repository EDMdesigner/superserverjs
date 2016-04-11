module.exports = function objectify(value) {
	if (typeof value === "object") {
		return value;
	}

	try {
		return JSON.parse(value);
	} catch (e) {
		return {};
	}
};
