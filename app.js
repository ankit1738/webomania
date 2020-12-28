	
require('dotenv').load();

var express 			= require("express")
	app 				= express(),
	mongoose 			= require('mongoose'),
	bodyParser 			= require('body-parser'),
	methodOverride 		= require('method-override'),
	User 				= require('./models/user.js'),
	Resources			= require('./models/resources.js'),
	expressSanitizer 	= require('express-sanitizer'),
	passport   		 	= require("passport"),
	LocalStrategy 		= require("passport-local"),
	session 			= require("express-session"),
	flash				= require("connect-flash"),
 	async 				= require("async"),
	nodemailer			= require("nodemailer"),
	crypto 				= require("crypto");
	middleware 			= require("./middleware/middleware.js");
//DATABASE CONNECTION
mongoose.connect("mongodb://localhost/webomania");
// mongoose.connect("mongodb://ankit:Ankit1738@ds249299.mlab.com:49299/webomania");
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("database conected!");
});


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(expressSanitizer());
app.use(require("express-session")({
	secret:"winter is here",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//FLASH
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//ROUTES
var indexRoutes = require("./routes/index");
var dashboardRoutes = require("./routes/dashboard");
var resourcesRoutes = require("./routes/resources");
app.use("/", indexRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/resources", resourcesRoutes);


//SERVER
app.listen(8000, function(){
	console.log("Server Started at port 8000");
});

// app.listen(process.env.PORT, process.env.IP, function(req, res){
// 	console.log("Blog server started at port 8000");
// });