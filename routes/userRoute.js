const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require("../middleware.js");
// const ExpressError = require("../utils/ExpressError.js");

const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");

router
.route("/signup")
.get(userController.renderSignUpForm) //1.) SignUp form.
.post(saveRedirectUrl, wrapAsync(userController.signUp)) //2.) SignUp after submitting the upper form.


router
.route("/login")
.get(userController.renderLoginForm)  //3.) Render login form.
.post(saveRedirectUrl,                //4.) Login
    passport.authenticate("local", {failureRedirect:"/login", failureFlash: true}),
    wrapAsync(userController.logIn))

//5.) LogOut
router.get("/logout", userController.logOut);

//6.) Profile
router.get("/profile", isLoggedIn, userController.profile);

module.exports = router;


//1.) SignUp form.
// router.get("/signup", userController.renderSignUpForm);

//2.) SignUp after submitting the upper form.
// wrapAsync is to handle the undefined errors. 
// router.post("/signup", saveRedirectUrl, wrapAsync(userController.signUp));


// Login: 
//3.) Render login form.
// router.get("/login", userController.renderLoginForm);
// Remember one thing, the authentication for login by passport is done only by passing it as a middleware function. 2-arguments. First is "local" because we are doing authentication locally in our computer. Second is an object where 2-key value pairs, first tells where to redirect if login failed means user not already exist, second is either we want to show an error flash message or not. 

//4.) Login
// router.post("/login", 
//     saveRedirectUrl, 
//     passport.authenticate("local", {failureRedirect:"/login", failureFlash: true}),
//     wrapAsync(userController.logIn));



