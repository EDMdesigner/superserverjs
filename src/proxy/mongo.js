/* 
 * MongoDB proxy shell
 */

var async = require("async");
var extend = require("extend");
var mongoCore = require("./mongoCore");

var dependencies = {
	async: async,
	extend: extend
};

module.exports = mongoCore(dependencies);