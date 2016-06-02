module.exports = function createMockProxy() {
	var mockProxy = {
		read: function(query, filter, callback) {
			callback();
		},
		createOne: function(data, filter, callback) {
			callback(null, {
				file: {}
			});
		},
		readOneById: function(id, filter, callback) {
			callback();
		},
		updateOneById: function(id, data, filter, callback) {
			callback();
		},
		destroyOneById: function(id, filter, callback) {
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
