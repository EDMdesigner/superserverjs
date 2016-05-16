module.exports = function checkBelongsTo(config) {
	if (!config) {
		return;
	}
	
	if (config.belongsTo) {
		if (config.belongsTo instanceof Array) {
			for (var idx = 0; idx < config.belongsTo.length; idx += 1) {
				var act = config.belongsTo[idx];

				if (!act.param) {
					throw new Error("config.belongsTo[" + idx + "] has to have a 'param' property");
				}

				if (!act.prop) {
					throw new Error("config.belongsTo[" + idx + "] has to have a 'prop' property");
				}
			}
		} else {
			if (!config.belongsTo.param) {
				throw new Error("config.belongsTo.param is mandatory");
			}

			if (!config.belongsTo.prop) {
				throw new Error("config.belongsTo.prop is mandatory");
			}
		}
	}
};
