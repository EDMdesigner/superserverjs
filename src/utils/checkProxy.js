module.exports = function checkProxy(config) {
	var msgPrefix = config.msgPrefix || "";

	msgPrefix += ".";

	if (typeof config.proxy.read !== "function") {
		throw new Error(msgPrefix + "read must be a function");
	}

	if (typeof config.proxy.createOne !== "function") {
		throw new Error(msgPrefix + "createOne must be a function");
	}

	if (typeof config.proxy.readOneById !== "function") {
		throw new Error(msgPrefix + "readOneById must be a function");
	}

	if (typeof config.proxy.updateOneById !== "function") {
		throw new Error(msgPrefix + "updateOneById must be a function");
	}

	if (typeof config.proxy.destroyOneById !== "function") {
		throw new Error(msgPrefix + "destroyOneById must be a function");
	}
};
