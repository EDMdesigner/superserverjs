var crypto = require("crypto");
var nextNum = 0;

module.exports = function generateId() {

	return function() {
		var now = Date.now();
		var hex = crypto.createHash("md5").update(now.toString() + nextNum).digest("hex");

		nextNum += 1;

		return hex;
	};
};