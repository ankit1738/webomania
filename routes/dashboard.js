var express = require("express");
var router  = express.Router();
var User    = require("../models/user");
var middleware 		= require("../middleware/middleware");

router.get("/", middleware.isLoggedIn,  function(req, res){
	res.render("admin");
});

router.get("/resetPassword/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err){
			res.send("Error");
		}else{
			res.render("reset");
		}
	});
});

router.post("/resetPassword/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(req.body.newPass1 === req.body.newPass2){

					user.setPassword(req.body.newPass1, function(err){
						//user.resetPasswordToken = undefined;
						//user.resetPasswordExpires = undefined;
						user.password = req.body.newPass1;		
						user.save(function(err){
							req.logIn(user, function(err){
								//done(err, user);
								req.flash("success", "Password Changes Successfully");
								res.redirect("/")
							});
						});
					});
				}else{
					req.flash('error', "Password do not match");
					return res.redirect('back');
				}
	});
});



module.exports = router;