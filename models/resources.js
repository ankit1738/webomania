var mongoose = require("mongoose");

var resourcesSchema = new mongoose.Schema({
	name: String,
	quantity: Number,
	owner:{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username: String
	},
	created: {type: Date, default:Date.now}
});
 

module.exports = mongoose.model("Resources", resourcesSchema);

