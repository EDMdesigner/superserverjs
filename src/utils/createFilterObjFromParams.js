module.exports = function createFilterObjFromParams(config) {
	if (!config.belongsTo) {
		return {};
	}

	if (!config.params) {
		return {};
	}

	var belongsTo = config.belongsTo;
	var params = config.params;

	var obj = {};

	if (belongsTo instanceof Array) {
		for (var idx = 0; idx < config.belongsTo.length; idx += 1) {
			var act = config.belongsTo[idx];

			obj[act.prop] = params[act.param];					
		}
	} else {
		obj[belongsTo.prop] = params[belongsTo.param];
	}

	return obj;
};
