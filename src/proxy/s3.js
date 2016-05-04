/* 
 * AWS S3 proxy shell
 */

var AWS = require("aws-sdk");
var generateId = require("../utils/generateId");
var s3Core = require("./s3Core");

var dependencies = {
	AWS: AWS,
	generateId: generateId
};

module.exports = s3Core(dependencies);
