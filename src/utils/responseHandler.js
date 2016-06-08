var fileType = require("file-type");

module.exports = function createResponseHandler(req, res, postHook) {

	return function handleResponse(err, result) {
		if (err) {
			res.json({err: err});
			if (postHook) {
				postHook(err);
			}
			return;
		}

		if (Buffer.isBuffer(result)) {
			var fType = fileType(result);

			if (fType) {
				res.set("Content-Type", fType.mime);
			}
			
			res.send(result);
			if (postHook) {
				postHook(null, result);
			}
			return;
		}

		res.json(result);

		if (postHook) {
			postHook(null, result);
		}
		
		return;
	};
};
