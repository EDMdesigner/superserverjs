module.exports = function objectify(value) {
	if (typeof value === "object") {
		return value;
	}

	let parsed;

	try {
		parsed = JSON.parse(value);
	} catch (e) {
		parsed = {};
	}

	// parsed = { title: /yx.-/gi }

	let keys = Object.keys(parsed);

	if (keys.length > 0) {
		let key = keys[0];

		if (typeof parsed[key] === "string") {
			try	{
				let findSplit = parsed[key].split("/");
				let rgxOptions = findSplit[findSplit.length - 1];

				findSplit.pop();
				findSplit.shift();
				let rgxPattern = findSplit.join("/");

				parsed[key] = new RegExp(rgxPattern, rgxOptions);
			} catch (e) {
			}
		}
	}
	return parsed;
};
