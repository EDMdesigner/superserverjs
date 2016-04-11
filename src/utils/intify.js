module.exports = function intify(value, defaultValue) {
	value = parseInt(value, 10);
	if (isNaN(value)) {
		value = defaultValue;
	}
	return value;
};
