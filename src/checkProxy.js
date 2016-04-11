module.exports = function checkProxy(config) {
	var proxy = config.proxy;

	var msgPrefix = config.msgPrefix || "";

	if (!proxy) {
		throw new Error(msgPrefix + " is mandatory");
	}

	msgPrefix += ".";

	if (typeof proxy.read !== "function") {
		throw new Error(msgPrefix + "read must be a function");
	}

	if (typeof proxy.createOne !== "function") {
		throw new Error(msgPrefix + "createOne must be a function");
	}

	if (typeof proxy.readOneById !== "function") {
		throw new Error(msgPrefix + "readOneById must be a function");
	}

	if (typeof proxy.updateOneById !== "function") {
		throw new Error(msgPrefix + "updateOneById must be a function");
	}

	if (typeof proxy.destroyOneById !== "function") {
		throw new Error(msgPrefix + "destroyOneById must be a function");
	}
};