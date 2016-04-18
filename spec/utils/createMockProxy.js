module.exports = function createMockProxy() {
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

	spyOn(mockProxy, "read").and.callThrough();
	spyOn(mockProxy, "createOne").and.callThrough();
	spyOn(mockProxy, "readOneById").and.callThrough();
	spyOn(mockProxy, "updateOneById").and.callThrough();
	spyOn(mockProxy, "destroyOneById").and.callThrough();

	return mockProxy;
};
