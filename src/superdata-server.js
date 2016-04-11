module.exports = {
	galleryRouter: require("./galleryRouter"),
	proxy: {
		file: require("./proxy/file"),
		mongo: require("./proxy/mongo"),
		s3: require("./proxy/s3")
	}
};
