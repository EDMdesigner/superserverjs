var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var gallerySchema = new Schema({
	user:	{
		type: Schema.ObjectId,
		ref: "User",
		required: true
	},
	absolute: {
		type: Boolean,
		default: false
	},
	data: {
		name: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		},
		width: {
			type: Number
		},
		height: {
			type: Number
		},
		date: {
			type: Date,
			default: Date.now
		},
		secureUrl: {
			type: String
		},
		thumbUrl: {
			type: String
		}
	},

	projects: Schema.Types.Mixed
});

module.exports = mongoose.model("Gallery", gallerySchema);
