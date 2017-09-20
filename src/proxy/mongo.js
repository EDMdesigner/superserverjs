/* 
 * MongoDB proxy shell
 */

var async = require("async");
var extend = require("extend");
var mongoCore = require("./mongoCore");
var ObjectId = require("mongoose").Types.ObjectId;

var dependencies = {
	async: async,
	extend: extend,
	ObjectId: ObjectId
};

module.exports = mongoCore(dependencies);