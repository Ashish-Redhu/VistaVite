const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js"); // It is necessary to import the model, as we will create the object of this model/class and then store in the database. 

router.get("/signup", (req, res)=>{
    res.render("signup.ejs");
})

// wrapAsync is to handle the undefined errors. 
router.post("/signup", wrapAsync(async(req, res)=>{
    try{
        let {username, email, password} = req.body; // Here we access the input fields of form with the help of their names, not with their id's. Id's are used to set label for them.
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);  // A new user registered. 
        // As we doing authentication, so using passport that's why we will use "modelname.register()" and we will password seperately not inside the object/document. 
        req.flash("success", "Registration Successful, Welcome to Vista-Vite !");  // Creating a popup.
        res.redirect("/listings");
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    // Even after using wrapAsync we are using "try-catch" because after finding the error we don't want to just only show the error using that default error-handeling middleware at the end of app.js. But we want the user to flash an error message as well as redirect to the /signup path again, in case the user already exist. 
}));

module.exports = router;


