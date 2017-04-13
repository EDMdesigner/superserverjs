module.exports = function proxyInterfaceHelper(config) {
	var configObj = config.config || {};
	var msgPrefix = config.msgPrefix;
	var checkProxy = require("../../src/utils/checkProxy");

	describe(msgPrefix, function() {
		it(msgPrefix + ".read", function() {
			expect(function() {
				configObj.read = "yo";

				checkProxy({
					proxy: configObj,
					msgPrefix: msgPrefix
				});
			}).toThrowError(msgPrefix + ".read must be a function");
		});

		it(msgPrefix + ".createOne", function() {
			expect(function() {
				configObj.read = function() {};

				checkProxy({
					proxy: configObj,
					msgPrefix: msgPrefix
				});
			}).toThrowError(msgPrefix + ".createOne must be a function");
		});

		it(msgPrefix + ".readOneById", function() {
			expect(function() {
				configObj.read = function() {};
				configObj.createOne = function() {};

				checkProxy({
					proxy: configObj,
					msgPrefix: msgPrefix
				});
			}).toThrowError(msgPrefix + ".readOneById must be a function");
		});

		it(msgPrefix + ".updateOneById", function() {
			expect(function() {
				configObj.read = function() {};
				configObj.createOne = function() {};
				configObj.readOneById = function() {};

				checkProxy({
					proxy: configObj,
					msgPrefix: msgPrefix
				});
			}).toThrowError(msgPrefix + ".updateOneById must be a function");
		});

		it(msgPrefix + ".destroyOneById", function() {
			expect(function() {
				configObj.read = function() {};
				configObj.createOne = function() {};
				configObj.readOneById = function() {};
				configObj.updateOneById = function() {};

				checkProxy({
					proxy: configObj,
					msgPrefix: msgPrefix
				});
			}).toThrowError(msgPrefix + ".destroyOneById must be a function");
		});
	});
};
