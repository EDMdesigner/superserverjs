var createFileProxy = require("./file");

var fileProxy = createFileProxy({
	basePath: "./",
	encoding: "utf8"
});

fileProxy.read({}, function (err, data) {
	console.log("read", data);

	fileProxy.createOne("asdf", function(err, result) {
		console.log("createOne", result);

		fileProxy.readOneById(1, function(err, result) {
			console.log("readOne", result);

			fileProxy.updateOneById(1, "asdfasdf", function() {
				fileProxy.readOneById(1, function(err, result) {
					console.log("readone2", result);

					setTimeout(function() {
						fileProxy.destroyOneById(1, function() {
							console.log("destroyed");
						});
					}, 3000);
				});
			});
		});
	});
});
