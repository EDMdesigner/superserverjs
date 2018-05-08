var createFileProxy = require("../../src/proxy/file");

describe("fileProxy", function() {
	describe("with invalid config", function() {
		it("without config", function() {
			expect(createFileProxy).toThrowError("config.basePath is mandatory");
		});

		it("config.idProperty", function() {
			expect(function() {
				createFileProxy({
					basePath: "."
				});
			}).toThrowError("config.idProperty is mandatory");
		});
	});

	describe("with valid config", function() {
		var proxy;
		var objId;
		beforeAll(function() {
			proxy = createFileProxy({
				basePath: "testFolder",
				idProperty: "myVeryId",
				encoding: "utf8"
			});
		});

		it("should create a file in the testFolder directory", function(done) {
			proxy.createOne({buffer: "asdf"}, function(err, result) {
				expect(err).toBeNull();
				expect(result.myVeryId).toBeDefined();

				objId = result.myVeryId;

				done();
			});
		});

		it("should list the directory", function(done) {
			proxy.read({}, function(err, result) {
				expect(err).toBeNull();
				expect(result.count).toBe(1);
				expect(result.items[0].myVeryId).toBe(objId);

				done();
			});
		});

		it("should read the file contents", function(done) {
			proxy.readOneById(objId, function(err, result) {
				expect(err).toBeNull();
				expect(result).toBe("asdf");

				done();
			});
		});

		it("should update the file contents", function(done) {
			proxy.updateOneById(objId, "jkl", function(err) {
				expect(err).toBeNull();

				done();
			});
		});

		it("should read the updated contents", function(done) {
			proxy.readOneById(objId, function(err, result) {
				expect(err).toBeNull();
				expect(result).toBe("jkl");

				done();
			});
		});

		it("should delete the file", function(done) {
			proxy.destroyOneById(objId, function(err) {
				expect(err).toBeNull();

				done();
			});
		});

		it("should return an error on readOneById", function(done) {
			proxy.readOneById(objId, function(err) {
				expect(err).toBeDefined();

				done();
			});
		});
	});
});
