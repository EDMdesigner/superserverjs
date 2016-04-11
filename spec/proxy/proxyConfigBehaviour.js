module.exports = function proxyInterfaceHelper(config) {
	var configObj = config.config || {};
	var factoryMethod = config.factoryMethod;
	var msgPrefix = config.msgPrefix;
	var prop = config.prop;

	describe(msgPrefix, function() {
		it(msgPrefix + " is mandatory", function() {
			expect(function() {
				factoryMethod(configObj);
			}).toThrowError(msgPrefix + " is mandatory");
		});

		it(msgPrefix + ".read", function() {
			expect(function() {
				configObj[prop] = {
					read: "yo"
				};

				factoryMethod(configObj);
			}).toThrowError(msgPrefix + ".read must be a function");
		});

		it(msgPrefix + ".createOne", function() {
			expect(function() {
				configObj[prop] = {
					read: function() {}
				};

				factoryMethod(configObj);
			}).toThrowError(msgPrefix + ".createOne must be a function");
		});

		it(msgPrefix + ".readOneById", function() {
			expect(function() {
				configObj[prop] = {
					read: function() {},
					createOne: function() {}
				};

				factoryMethod(configObj);
			}).toThrowError(msgPrefix + ".readOneById must be a function");
		});

		it(msgPrefix + ".updateOneById", function() {
			expect(function() {
				configObj[prop] = {
					read: function() {},
					createOne: function() {},
					readOneById: function() {}
				};

				factoryMethod(configObj);
			}).toThrowError(msgPrefix + ".updateOneById must be a function");
		});

		it(msgPrefix + ".destroyOneById", function() {
			expect(function() {
				configObj[prop] = {
					read: function() {},
					createOne: function() {},
					readOneById: function() {},
					updateOneById: function() {}
				};
				
				factoryMethod(configObj);
			}).toThrowError(msgPrefix + ".destroyOneById must be a function");
		});
	});
};