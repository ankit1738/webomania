var express 		= require("express");
var router 			= express.Router();
var User    		= require("../models/user");
var Resources    	= require("../models/resources");
var middleware 		= require("../middleware/middleware");

router.get("/add", middleware.isLoggedIn,  function(req, res){
	res.render("resources/add");
});

router.post("/add", function(req, res){
	// var owner = {
	// 	id:req.user._id,
	// 	username:req.user.username
	// };
	var newResource = new Resources({
							name: req.body.name,
							quantity: req.body.quantity,
							//owner:owner
	});
	Resources.create(newResource, function(err, resource){
		if(err){
			console.log(err);
		}else{
			req.flash("success", "Resource Added");
			res.redirect("/resources/add");
		}
	});

});

module.exports = router;