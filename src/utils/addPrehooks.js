module.exports = function addPrehooksToParams(config, params, hook) {
	if (config.preHooks[hook]) {
		if (typeof config.preHooks[hook] === "function") {
			params.push(config.preHooks[hook]);
		} else if (config.preHooks[hook] instanceof Array) {
			params = params.concat(config.preHooks[hook]);
		} else {
			throw new Error(
				"config.preHooks[" + hook + "] must be a function or Array"
			);
		}
	}

	return params;
}
