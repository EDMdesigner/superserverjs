var fileType = require("file-type");

module.exports = function createResponseHandler(res) {
	return function handleResponse(err, result) {
		if (err) {
			return res.json({err: err});
		}


		if (Buffer.isBuffer(result)) {
			res.set("Content-Type", fileType(result).mime);
			return res.send(result);
		}

		return res.json(result);
	};
};
