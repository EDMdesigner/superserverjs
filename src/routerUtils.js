function createResponseHandler(res) {
	return function handleResponse(err, result) {
		if (err) {
			return res.json({err: err});
		}

		res.json(result);
	};
}

function intify(value, defaultValue) {
	value = parseInt(value, 10);
	if (isNaN(value)) {
		value = defaultValue;
	}
	return value;
}

function objectify(value) {
	if (typeof value === "object") {
		return value;
	}

	try {
		return JSON.parse(value);
	} catch (e) {
		return {};
	}
}


module.exports = {
	createResponseHandler: createResponseHandler,
	intify: intify,
	objectify: objectify
};