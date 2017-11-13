var express = require("express");
var bodyParser = require("body-parser");

var request = require("supertest");
var path = require("path");

var createGalleryRouter = require("../../src/router/gallery");

var proxyConfigBehaviour = require("../proxy/proxyConfigBehaviour");
var createMockProxy = require("../utils/createMockProxy");

describe("Gallery router", function() {
	describe("with invalid config", function() {
		it("config.createInfoObject", function() {
			expect(createGalleryRouter).toThrowError("config.createInfoObject must be a function");
		});

		it("config.calculateBinaryId", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {}
				}).toThrowError("config.fileUploadProp is mandatory");
			});
		});

		it("config.fileUploadProp", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					calculateBinaryId: function() {}
				}).toThrowError("config.fileUploadProp is mandatory");
			});
		});

		it("config.fromUrlProp", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					calculateBinaryId: function() {},
					fileUploadProp: "file"
				});
			}).toThrowError("config.fromUrlProp is mandatory");
		});

		it("no infoProxy", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					calculateBinaryId: function() {},
					fileUploadProp: "file",
					fromUrlProp: "url"
				});
			}).toThrowError("Neither infoProxy nor getInfoProxy function provided.");
		});

		it("no binaryProxy", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					calculateBinaryId: function() {},
					fileUploadProp: "file",
					fromUrlProp: "url",
					infoProxy: "PROXY"
				});
			}).toThrowError("Neither binaryProxy nor getBinaryProxy function provided.");
		});

		it("no binaryProxy, getInfoProxy is function", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					calculateBinaryId: function() {},
					fileUploadProp: "file",
					fromUrlProp: "url",
					getInfoProxy: function() {}
				});
			}).toThrowError("Neither binaryProxy nor getBinaryProxy function provided.");
		});

		it("config.infoProxy not a function", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					calculateBinaryId: function() {},
					fileUploadProp: "file",
					fromUrlProp: "url",
					getInfoProxy: "NOT A FUNCTION",
					getBinaryProxy: function() {}
				});
			}).toThrowError("The provided getInfoProxy is not a function.");
		});

		it("config.binaryProxy not a function", function() {
			expect(function() {
				createGalleryRouter({
					createInfoObject: function() {},
					calculateBinaryId: function() {},
					fileUploadProp: "file",
					fromUrlProp: "url",
					getInfoProxy: function() {},
					getBinaryProxy: "NOT A FUNCTION"
				});
			}).toThrowError("The provided getBinaryProxy is not a function.");
		});

		proxyConfigBehaviour({
			config: {
				createInfoObject: function() {},
				calculateBinaryId: function() {},
				fileUploadProp: "file",

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
				calculateBinaryId: function() {},
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
		var mockBinaryProxy;
		var mockInfoProxy;

		var app;
		var createInfoObject;

		beforeEach(function() {
			app = express();
			app.use(bodyParser.urlencoded({
				limit: "2mb",
				extended: true,
				parameterLimit: 10000
			}));
			app.use(bodyParser.json({limit: "2mb"}));

			mockBinaryProxy = createMockProxy();
			mockInfoProxy = createMockProxy();
			var obj = {
				createInfoObject: function (config, callback) {
					callback(config);
				}
			}

			spyOn(obj, "createInfoObject").and.callThrough();
			createInfoObject = obj.createInfoObject;


			function calculateBinaryId() {

			}

			createGalleryRouter({
				router: app,

				binaryProxy: mockBinaryProxy,
				infoProxy: mockInfoProxy,

				createInfoObject: createInfoObject,
				calculateBinaryId: calculateBinaryId,

				validMimeTypes: ["image/jpeg", "image/gif"],

				fileUploadProp: "file",
				fromUrlProp: "url"
			});
		});

		it("GET /", function(done) {
			request(app)
				.get("/")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockInfoProxy.read).toHaveBeenCalled();
					expect(mockInfoProxy.createOne).not.toHaveBeenCalled();
					expect(mockInfoProxy.readOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.destroyOneById).not.toHaveBeenCalled();

					expect(mockBinaryProxy.read).not.toHaveBeenCalled();
					expect(mockBinaryProxy.createOne).not.toHaveBeenCalled();
					expect(mockBinaryProxy.readOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.destroyOneById).not.toHaveBeenCalled();

					done();
				});
		});

		it("POST / - url", function(done) {
			request(app)
				.post("/")
				.send({url: "http://kep.cdn.index.hu/1/0/1847/18470/184708/18470808_1135434_85d8df3786ff04ff767194b4f4a227f6_wm.jpg"})
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockInfoProxy.read).not.toHaveBeenCalled();
					expect(mockInfoProxy.createOne).toHaveBeenCalled();
					expect(mockInfoProxy.readOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.destroyOneById).not.toHaveBeenCalled();
					expect(createInfoObject).toHaveBeenCalled();

					expect(mockBinaryProxy.read).not.toHaveBeenCalled();
					expect(mockBinaryProxy.createOne).toHaveBeenCalled();
					expect(mockBinaryProxy.readOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.destroyOneById).not.toHaveBeenCalled();

					done();
				});
		});

		it("POST / - FormData", function(done) {
			request(app)
				.post("/")
				.attach("file", path.join(__dirname, "/testpic.gif"))
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockInfoProxy.read).not.toHaveBeenCalled();
					expect(mockInfoProxy.createOne).toHaveBeenCalled();
					expect(mockInfoProxy.readOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.destroyOneById).not.toHaveBeenCalled();
					expect(createInfoObject).toHaveBeenCalled();					

					expect(mockBinaryProxy.read).not.toHaveBeenCalled();
					expect(mockBinaryProxy.createOne).toHaveBeenCalled();
					expect(mockBinaryProxy.readOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.destroyOneById).not.toHaveBeenCalled();

					done();
				});
		});

		it("POST / - FormData invalid undefined type", function(done) {
			request(app)
				.post("/")
				.attach("file", path.join(__dirname, "/wrongMime.json"))
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockInfoProxy.read).not.toHaveBeenCalled();
					expect(mockInfoProxy.createOne).not.toHaveBeenCalled();
					expect(mockInfoProxy.readOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.destroyOneById).not.toHaveBeenCalled();

					expect(mockBinaryProxy.read).not.toHaveBeenCalled();
					expect(mockBinaryProxy.createOne).not.toHaveBeenCalled();
					expect(mockBinaryProxy.readOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.destroyOneById).not.toHaveBeenCalled();

					done();
				});
		});

		it("GET /:id", function(done) {
			request(app)
				.get("/1")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockInfoProxy.read).not.toHaveBeenCalled();
					expect(mockInfoProxy.createOne).not.toHaveBeenCalled();
					expect(mockInfoProxy.readOneById).toHaveBeenCalled();
					expect(mockInfoProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.destroyOneById).not.toHaveBeenCalled();

					expect(mockBinaryProxy.read).not.toHaveBeenCalled();
					expect(mockBinaryProxy.createOne).not.toHaveBeenCalled();
					expect(mockBinaryProxy.readOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.destroyOneById).not.toHaveBeenCalled();

					done();
				});
		});

		it("PUT /:id", function(done) {
			request(app)
				.put("/1")
				.send({title: "renamed"})
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockInfoProxy.read).not.toHaveBeenCalled();
					expect(mockInfoProxy.createOne).not.toHaveBeenCalled();
					expect(mockInfoProxy.readOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.updateOneById).toHaveBeenCalled();
					expect(mockInfoProxy.destroyOneById).not.toHaveBeenCalled();

					expect(mockBinaryProxy.read).not.toHaveBeenCalled();
					expect(mockBinaryProxy.createOne).not.toHaveBeenCalled();
					expect(mockBinaryProxy.readOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.destroyOneById).not.toHaveBeenCalled();

					done();
				});
		});

		it("DELETE /:id", function(done) {
			request(app)
				.del("/1")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockInfoProxy.read).not.toHaveBeenCalled();
					expect(mockInfoProxy.createOne).not.toHaveBeenCalled();
					expect(mockInfoProxy.readOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockInfoProxy.destroyOneById).toHaveBeenCalled();

					expect(mockBinaryProxy.read).not.toHaveBeenCalled();
					expect(mockBinaryProxy.createOne).not.toHaveBeenCalled();
					expect(mockBinaryProxy.readOneById).not.toHaveBeenCalled();
					expect(mockBinaryProxy.updateOneById).not.toHaveBeenCalled();
					// only call this function if the referred object exists in
					// the infoProxy
					expect(mockBinaryProxy.destroyOneById).not.toHaveBeenCalled();

					done();
				});
		});
	});
});
