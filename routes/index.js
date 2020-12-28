var express 		= require("express");
var router 			= express.Router();
var User    		= require("../models/user");
var Resources  		= require("../models/resources");
var async 			= require("async");
var	nodemailer		= require("nodemailer");
var	crypto 			= require("crypto");
var middleware 		= require("../middleware/middleware");

router.get("/", function(req, res){
	Resources.find({}, function(err, allResources){
		if(err){
			console.log(err);
		}else{
			//console.log(allResources);
			res.render("index", { allResources : allResources });
		}
	});
});

router.get("/login", function(req, res){
	res.render("login");
});

router.post("/login", passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/login",
	successFlash: 'Welcome to my Webomania Peoject',
	failureFlash: 'Username/Password incorrect'	
}),function(req, res){
});


router.get("/register", function(req, res){
	res.render("register");
});

router.post("/register", function(req, res){

	var newUser = new User({
					isActive: false,
					email: req.body.email,
					fname: req.body.fname,
					lname: req.body.lname,
					username: req.body.username,
					password: req.body.password, 
	});
	if(req.body.adminCode === "secretcode123")
	{
		newUser.isAdmin = true;
	}else{
		newUser.isAdmin = false;
	}
	User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        else{
	        passport.authenticate("local")(req, res, function(){
	            //req.flash("success", "Registerd Sucessfully\nWelcome to this project " + user.fname);
	            //res.redirect("/");  
	        async.waterfall([
			function(done){
				crypto.randomBytes(20, function(err, buff){
					var token = buff.toString('hex');
					done(err, token);
				});
			},
			function(token, done){
					user.activateEmailToken = token;
					user.activateEmailExpires = Date.now() + 3600000; //1 hour
					user.save(function(err){
						done(err, token, user);
					});
				
			},
			function(token, user, done){
				var transport = require('nodemailer-smtp-transport');
				var smtpTransport = nodemailer.createTransport(transport({
					service: 'gmail',
					host: 'smtp.gmail.com',
					auth: {
						user: process.env.MAIL,
						pass: process.env.PW
					}
				}));
				var mailOptions = {
					to: user.email,
					from: process.env.MAIL,
					subject: "Webomania Account Activation",
					text: 'Click on the link to activate the account\n' + 
					'http://' + req.headers.host + '/activate/' + token + '\n\n'
				};
				smtpTransport.sendMail(mailOptions, function(err){
					//console.log('mail sent');
					req.flash('success', 'User Registered. Please check your email ' + user.email + ' for account conformation.');
					done(err, 'done');			
				});
			}
			], function(err){
				if(err){
					// return next(err);
					console.log("BHAI" + err);
				}
				res.redirect('/');
			});         
	        });
        }
    });

});

router.get("/activate/:token", function(req, res){

	User.findOne({ activateEmailToken: req.params.token, activateEmailExpires: { $gt: Date.now()} }, function(err, user){
		if(!user){
			req.flash('error', 'Password token invalid or has expired');
			return res.redirect('/');
		}else{
			//console.log(user);
			user.activateEmailToken = undefined;
			user.activateEmailExpires = undefined;
			user.isActive = true;
			user.save(function(err){
				req.logIn(user, function(err){
					//done(err, user);
				});
			});
			req.flash("success", "Email Confirmed!");
			res.redirect("/");
		}
		
	});	
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out succesfully!");
	res.redirect("/");
});

router.get("/forgot", function(req, res){
	res.render("forgot");
});

router.post("/forgot", function(req, res){
	async.waterfall([
			function(done){
				crypto.randomBytes(20, function(err, buff){
					var token = buff.toString('hex');
					done(err, token);
				});
			},
			function(token, done){
				User.findOne({ email:req.body.email }, function(err, user){
					if(!user){
						req.flash('error', 'No account with that email exists.');
						return res.redirect('/forgot');
					}
					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000;//1 hour
					user.save(function(err){
						done(err, token, user);
					});
				});
			},
			function(token, user, done){
				var transport = require('nodemailer-smtp-transport');
				var smtpTransport = nodemailer.createTransport(transport({
					service: 'gmail',
					host: 'smtp.gmail.com',
					auth: {
						user: process.env.MAIL,
						pass: process.env.PW
					}
				}));
				var mailOptions = {
					to: user.email,
					from: process.env.MAIL,
					subject: "Webomania Password Reset",
					text: 'Click on the link to reset the password\n' + 
					'http://' + req.headers.host + '/reset/' + token + '\n\n'
				};
				smtpTransport.sendMail(mailOptions, function(err){
					console.log('mail sent');
					req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions');
					done(err, 'done');			
				});
			}
			], function(err){
				if(err){
					// return next(err);
					console.log("BHAI" + err);
				}
				res.redirect('/forgot');
			});
});

router.get('/reset/:token', function(req, res){
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()} }, function(err, user){
		if(!user){
			req.flash('error', 'Password token invalid or has expired');
			return res.redirect('/forgot');
		}
		res.render('forgotReset', { token: req.params.token});
	});
});

router.post('/reset/:token', function(req, res){
	async.waterfall([
		function(done){
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()} }, function(err, user){
				if(!user){
						req.flash('error', 'Password token invalid or has expired');
					return res.redirect('back');
				}
				if(req.body.password === req.body.confirm){
						user.setPassword(req.body.password, function(err){
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;
						user.password = req.body.password;
						user.save(function(err){
							req.logIn(user, function(err){
								done(err, user);
							});
						});
					});
				}else{
					req.flash('error', "Password do not match");
					return res.redirect('back');
				}
			});
		},
		function(user, done){
			var transport = require('nodemailer-smtp-transport');
			var smtpTransport = nodemailer.createTransport(transport({
				service: 'gmail',
				host: 'smtp.gmail.com',
				auth: {
					user: 'ankit1738@gmail.com',
					pass: process.env.PW
				}
			}));
			var mailOptions = {
				to: user.email,
				from: 'ankit1738@gmail.com',
				subject: "Your Password has been changed",
				text: 'Password for account \n' +  user.email + ' has been changed\n\n'
			};
			smtpTransport.sendMail(mailOptions, function(err){
				console.log('mail sent');
				req.flash('success', 'Success! Your password has been changes');
				done(err, 'done');			
			});
		}
	], function(err){
		res.redirect('/');
	});
});

module.exports = router;