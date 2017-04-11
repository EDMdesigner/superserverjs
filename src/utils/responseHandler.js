var fileType = require("file-type");



function createResponseHandler(req, res, postHook) {

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
}

module.exports = function createResponseHandlerWithHooks(config, req, res, hook) {
	if (config.postHooks && config.postHooks[hook]) {
		var responseHandler = createResponseHandler(
			req, res, config.postHooks[hook]
		);
	} else {
		var responseHandler = createResponseHandler(req, res);
	}

	return responseHandler;
};
