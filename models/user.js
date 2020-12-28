var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	email: String,
	fname: String,
	lname: String,
	username: String,
	password: String,
	isAdmin: Boolean,
	isActive: Boolean,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	activateEmailToken: String,
	activateEmailExpires: Date,
	created: {type: Date, default:Date.now}
});

userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", userSchema);

