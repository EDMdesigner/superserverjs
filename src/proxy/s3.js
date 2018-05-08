/* 
 * AWS S3 proxy shell
 */

var AWS = require("aws-sdk");
var generateId = require("../utils/generateId");
var s3Core = require("./s3Core");
var fileType = require("file-type");
var path = require("path");
var dateformat = require("dateformat");

var dependencies = {
	AWS: AWS,
	generateId: generateId,
	fileType: fileType,
	path: path,
	dateformat: dateformat
};

module.exports = s3Core(dependencies);
