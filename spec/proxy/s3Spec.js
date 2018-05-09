var generateId = require("../../src/utils/generateId");
var s3Core = require("../../src/proxy/s3Core");

var mockAWS = {
	S3: function() {}
};


describe("AWS S3 proxy", function() {

	var fakeMethod = function(params, cb) {
		cb(null, {Contents: []});
	};

	var s3Proto = {
		listObjects: fakeMethod,
		upload: fakeMethod,
		getObject: fakeMethod,
		deleteObject: fakeMethod
	};

	var createS3Proxy;

	beforeAll(function() {
		spyOn(s3Proto, "listObjects").and.callThrough();
		spyOn(s3Proto, "upload").and.callThrough();
		spyOn(s3Proto, "getObject").and.callThrough();
		spyOn(s3Proto, "deleteObject").and.callThrough();

		mockAWS.S3.prototype = s3Proto;

		createS3Proxy = s3Core({
			generateId: generateId,
			AWS: mockAWS,
			fileType: function() {
				return {
					mime: "mime"
				};
			},
			path: {
				basename: jasmine.createSpy(),
				extname: jasmine.createSpy(),

			},
			dateformat: jasmine.createSpy()
		});
	});

	describe("with invalid config", function() {
		it("missing config.accessKeyId", function() {
			expect(function() {
				createS3Proxy({
					secretAccessKey: "test",
					region: "test",
					bucket: "test"
				});
			}).toThrowError("config.accessKeyId is mandatory!");
		});

		it("missing config.secretAccessKey", function() {
			expect(function() {
				createS3Proxy({
					accessKeyId: "test",
					region: "test",
					bucket: "test"
				});
			}).toThrowError("config.secretAccessKey is mandatory!");
		});

		it("missing config.region", function() {
			expect(function() {
				createS3Proxy({
					accessKeyId: "test",
					secretAccessKey: "test",
					bucket: "test"
				});
			}).toThrowError("config.region is mandatory!");
		});

		it("missing config.bucket", function() {
			expect(function() {
				createS3Proxy({
					accessKeyId: "test",
					secretAccessKey: "test",
					region: "test"
				});
			}).toThrowError("config.bucket is mandatory!");
		});

		it("invalid config.generateId type", function() {
			expect(function() {
				createS3Proxy({
					accessKeyId: "test",
					secretAccessKey: "test",
					region: "test",
					bucket: "test",
					generateId: {}
				});
			}).toThrowError("config.generateId must be a function!");
		});
	});

	describe("with valid config", function() {
		var proxy;

		beforeAll(function() {
			proxy = createS3Proxy({
				accessKeyId: "test",
				secretAccessKey: "test",
				region: "test",
				bucket: "test"
			});
		});

		describe("interface", function() {
			it("read", function() {
				expect(typeof proxy.read).toEqual("function");
			});

			it("createOne", function() {
				expect(typeof proxy.createOne).toEqual("function");
			});

			it("readOneById", function() {
				expect(typeof proxy.readOneById).toEqual("function");
			});

			it("updateOneById", function() {
				expect(typeof proxy.updateOneById).toEqual("function");
			});

			it("destroyOneById", function() {
				expect(typeof proxy.destroyOneById).toEqual("function");
			});
		});

		describe("behaviour", function() {
			it("read", function() {
				proxy.read({buffer: "asdf"}, (err, response) => {console.log(response, err);});
				expect(s3Proto.listObjects).toHaveBeenCalled();
			});

			it("createOne", function() {
				proxy.createOne({buffer: "asdf"}, (err, response) => {console.log(response, err);});
				expect(s3Proto.upload).toHaveBeenCalled();
				expect(s3Proto.upload.calls.argsFor(0)[0].ContentType).toBe("mime");
			});

			it("readOneById", function() {
				proxy.readOneById({buffer: "asdf"}, (err, response) => {console.log(response, err);});
				expect(s3Proto.getObject).toHaveBeenCalled();
			});

			it("updateOneById", function() {
				proxy.updateOneById({buffer: "asdf"}, {}, (err, response) => {console.log(response, err);});
				expect(s3Proto.upload).toHaveBeenCalled();
			});

			it("destroyOneById", function() {
				proxy.destroyOneById({buffer: "asdf"}, (err, response) => {console.log(response, err);});
				expect(s3Proto.deleteObject).toHaveBeenCalled();
			});
		});
	});
});
