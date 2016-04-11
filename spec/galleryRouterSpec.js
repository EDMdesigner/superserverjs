var createGalleryRouter = require("../src/galleryRouter");

var proxyConfigHelper = require("./proxyConfigHelper");

describe("Gallery router", function() {
	describe("with invalid config", function() {
		proxyConfigHelper({
			config: {},
			factoryMethod: createGalleryRouter,
			msgPrefix: "config.binaryProxy",
			prop: "binaryProxy"
		});

		var mockProxy = {
			read: function(query, callback) {
				callback();
			},
			createOne: function(data, callback) {
				callback();
			},
			readOneById: function(id, callback) {
				callback();
			},
			updateOneById: function(id, data, callback) {
				callback();
			},
			destroyOneById: function(id, callback) {
				callback();
			}
		};

		proxyConfigHelper({
			config: {
				binaryProxy: mockProxy,
			},
			factoryMethod: createGalleryRouter,
			msgPrefix: "config.infoProxy",
			prop: "infoProxy"
		});

	});

	describe("with valid config", function() {

	});
});
