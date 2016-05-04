var crypto = require("crypto");

module.exports = function generateId() {
	var nextNum = 0;

	return function() {
		var now = new Date();
		var hex = crypto.createHash("md5").update(now.toString() + nextNum).digest("hex");

		nextNum += 1;

		return hex;
	};
};