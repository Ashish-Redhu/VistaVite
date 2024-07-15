const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js"); // It is necessary to import the model, as we will create the object of this model/class and then store in the database. 
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

// SignUp
router.get("/signup", (req, res)=>{
    res.render("signup.ejs");
})

// wrapAsync is to handle the undefined errors. 
router.post("/signup", saveRedirectUrl, wrapAsync(async(req, res)=>{
    try{
        let {username, email, password} = req.body; // Here we access the input fields of form with the help of their names, not with their id's. Id's are used to set label for them.
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);  // A new user registered. 
        // As we doing authentication, so using passport that's why we will use "modelname.register()" and we will password seperately not inside the object/document. 

        // Directly login after Signup.
        req.login(registeredUser, (err)=>{
            if(err)
            {return next(err);}
            req.flash("success", "Registration Successful, Welcome to Vista-Vite !");  // Creating a popup.
            let redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
            // Redirect the user not to "/listings" but to the path he requested earlier. That path we have stored in a local variable using middleware. 
        });
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    // Even after using wrapAsync we are using "try-catch" because after finding the error we don't want to just only show the error using that default error-handeling middleware at the end of app.js. But we want the user to flash an error message as well as redirect to the /signup path again, in case the user already exist. 
}));


// Login: 
router.get("/login", (req, res)=>{
    res.render("login.ejs");
});
// Remember one thing, the authentication for login by passport is done only by passing it as a middleware function. 2-arguments. First is "local" because we are doing authentication locally in our computer. Second is an object where 2-key value pairs, first tells where to redirect if login failed means user not already exist, second is either we want to show an error flash message or not. 
router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect:"/login", failureFlash: true}),wrapAsync(async(req, res)=>{
    req.flash("success", "Welcome back to Vista-Vite !");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}));


router.get("/logout", (req, res, next)=>{
    // It is an inbuilt method of "passport" which will remove data of user from current session and log it out. 
    req.logOut((err)=>{
        if(err)
        {return next(err);}
        req.flash("success", "You have been logged out !");
        res.redirect("/listings");
    });
// It take a callback as an argument and there we can perform certain tasks.
});

module.exports = router;


