var createGalleryRouter = require("../../src/router/gallery");

var proxyConfigBehaviour = require("../proxy/proxyConfigBehaviour");

describe("Gallery router", function() {
	describe("with invalid config", function() {
		it("config.createInfoObject", function() {
			expect(createGalleryRouter).toThrowError("config.createInfoObject must be a function");
		});

		it("config.fileUploadProp", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {}
				}).toThrowError("config.fileUploadProp is mandatory");
			});
		});

		it("config.fromUrlProp", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					fileUploadProp: "file"
				});
			}).toThrowError("config.fromUrlProp is mandatory");
		});

		proxyConfigBehaviour({
			config: {
				createInfoObject: function() {},
				fileUploadProp: "file",
				fromUrlProp: "url"
			},
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

		proxyConfigBehaviour({
			config: {
				createInfoObject: function() {},
				fileUploadProp: "file",
				fromUrlProp: "url",
				binaryProxy: mockProxy
			},
			factoryMethod: createGalleryRouter,
			msgPrefix: "config.infoProxy",
			prop: "infoProxy"
		});

	});

	describe("with valid config", function() {

	});
});
