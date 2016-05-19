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

		proxyConfigBehaviour({
			config: {
				createInfoObject: function() {},
				calculateBinaryId: function() {},
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
			createInfoObject = jasmine.createSpy("createInfoObjectSpy");


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
				.send({url: "http://images.buycostumes.com/mgen/merchandiser/mail-order-bride-adult-costume-bc-800820.jpg"})
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
					expect(mockBinaryProxy.destroyOneById).toHaveBeenCalled();

					done();
				});
		});
	});
});
