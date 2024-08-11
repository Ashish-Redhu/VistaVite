const User = require("../models/user.js"); // It is necessary to import the model, as we will create the object of this model/class and then store in the database. 
const Listing = require('../models/listing');
//1.) SignUp form.
module.exports.renderSignUpForm = (req, res)=>{
    res.render("signup.ejs");
};

//2.) SignUp after submitting the upper form.
module.exports.signUp = async(req, res)=>{
    try{
        let {username, email, password, role} = req.body; // Here we access the input fields of form with the help of their names, not with their id's. Id's are used to set label for them.
        const newUser = new User({email, username, role});
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
}


//3.) Render LogIn form.
module.exports.renderLoginForm = (req, res)=>{
    res.render("login.ejs");
};

//4.) Login
module.exports.logIn = async(req, res)=>{
    req.flash("success", "Welcome back to Vista-Vite !");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

//5.) LogOut
module.exports.logOut =  (req, res, next)=>{
    // It is an inbuilt method of "passport" which will remove data of user from current session and log it out. 
    req.logOut((err)=>{
        if(err)
        {return next(err);}
        req.flash("success", "You have been logged out !");
        res.redirect("/listings");
    });
// It take a callback as an argument and there we can perform certain tasks.
};

//6.) Profile
module.exports.profile = async (req, res) => {
    console.log("Start.........");
    const user = res.locals.currUser;

    try {
        const user = await User.findById(req.user._id).populate('listings');
        // Log user object to ensure it’s populated
        console.log("User fetched:", user);

        // Update `res.locals.currUser` to include the fully populated user object
        res.locals.currUser = user;

        console.log("Done.........Profile fetched.");
        res.render("profile.ejs"); // Render the profile page
    } catch (err) {
        console.error("Error fetching user profile:", err);
        req.flash('error', 'Unable to load profile.');
        res.redirect('/');
    }
};
