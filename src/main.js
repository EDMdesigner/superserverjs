module.exports = {
	proxy: {
		file: require("./proxy/file"),
		mongo: require("./proxy/mongo"),
		s3: require("./proxy/s3")
	},
	router: {
		crud: require("./router/crud"),
		gallery: require("./router/gallery")
	}
};
