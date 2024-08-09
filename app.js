require('dotenv').config();

const express = require("express"); 
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override"); // to make requests other than GET and POST.
const ejsMate = require("ejs-mate");     // Helps to create templates. 
// const wrapAsync = require("./utils/wrapAsync.js"); // Because now it is not in use.
const ExpressError = require("./utils/ExpressError.js");
const listingRoute = require("./routes/listingRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const userRoute = require("./routes/userRoute.js");
const companyRoute = require("./routes/companyRoute.js");
const session = require("express-session");
const MongoStore = require('connect-mongo'); // To store session info in MongoDB Atlas. 
const flash = require("connect-flash");
const User = require("./models/user.js"); // This is User model not route.
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { constants } = require('buffer');

// Setting up an express app.
const app = express();
const PORT = 9000;
app.listen(PORT, ()=>{
    console.log(`Server is listening on http://localhost:${PORT}`);
})

// Connecting with database 'wanderlust'
const dbUrl = process.env.ATLASDB_URL;
const secret = process.env.SECRET;
async function main(){
    await mongoose.connect(dbUrl);
}
main()
.then(()=>{
    console.log("Connected to database wanderlust");
})
.catch((err)=>{
    console.log("Some error in connection", err);
})

// This is for telling to NodeJS, "hey, view engine is ejs. So, Node view engine(ejs) will look for views in the view folder whose path we set in second line."
app.set("view engine", "ejs");


// app.set("views", path.join(__dirname, "./views/listings")); // We are telling ki bhai apne jo views/ejs files h wo ejs >> listings ke ander h. 
// We have done this because it may happen in future we have to create some views for a particular user or something like that then we will create in seperate folder inside "views".
// app.set("views", path.join(__dirname, "./views"));

// To set multiple views: 
app.set("views", [
    path.join(__dirname, "./views"),
    path.join(__dirname, "./views/listings"),
    path.join(__dirname, "./views/users")
  ]);


// To make Node able to understand the data received in diff-diff formats that is availabe in "req.body";
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON data
app.use(express.json());

app.use(methodOverride("_method"));

// To use static files.
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

// The below code is to store session data in Cloud Store. 
const store = MongoStore.create({
  mongoUrl: dbUrl, // this is url of cloud storage where database is present. 
  crypto: {
    secret: secret
  },
  touchAfter: 10*60, // This is is seconds. Means if nothing has been updated in database then don't logout or don't do anything with the page, even when the user refresh or close the page. Usually we set it to 24hrs = 24*60*60. But here I provided only 10mins = 10*60 in seconds. 
});

store.on("error", ()=>{
    console.log("Error in MONGO SESSION STORE", err);
  })

// Include session and cookies.
const sessionOptions = {
    store, 
    secret: secret, // we will change it later.
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (7*24*60*60*1000), // Here we have saved the cookie for next 7-days. And time is provided in milliseconds. 
        maxAge: 7*24*60*60*1000,
        httpOnly: true // This is for security reasons to prevent cross scripting attaks.
    },
}
app.use(session(sessionOptions));

// Include connect flash which itself is a part of session. 
app.use(flash());


// For passport:::::
app.use(passport.initialize()); 
app.use(passport.session()); // It is important to use this so that the web-application get to know when requests are made on it's diff-diff pages are made by the same user or not. Because if session is same then the user will be considered as same else diff user can be there.
passport.use(new LocalStrategy(User.authenticate())); // passport.use: A middleware inside which it is told that use "LocalStrategy" which is the main working department of "passport" and authenticate the user created. 
passport.serializeUser(User.serializeUser()); // Whenever a new user come on the website, means started a new session then we starting getting his/her data, that means serializing.
passport.deserializeUser(User.deserializeUser()); // Whenever someone leaves the website, we simply deletes his/her data, except some info, this is deserialization.

// The below new user of "/demouser" is for temporary testing basis. 
/*
app.get("/demouser", async (req, res)=>{
    let fakeUser = new User({
        email:"fakeuser@gmail.com",
        username: "fake" // even though we haven't defined username in the schema of "User" still we can insert this field. As passport itself create these fields. 
    });
    let registeredUser = await User.register(fakeUser, "fakePassword"); // Notice here, we haven't used fakeuser.save(); We have used User(model_name).register(object, passwordForThisObject); This is because we are using "passport".
    res.send(registeredUser);
})
*/
// Here we stored the message of "success" flash in local variable named as "success", this local variable is in middleware so will be accessible by all the pages. 
app.use((req, res, next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");

    // the below thing is to check which thing to show "Signup & Login" or "Logout";
    res.locals.currUser = req.user;   // req.user stores the user that is loggedin in this session using "passport". If noone is loggedin it will contain undefined. 
    next();
})


app.get("/", (req, res)=>{
    res.redirect("/listings");
})

app.use("/listings", listingRoute);
app.use("/listings/:id/reviews", reviewRoute);
app.use("/company", companyRoute);
app.use("/", userRoute);



// If any of the request doesn't match with url/api, it will be handled here.
app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found"));
})

// This is last error handling middleware, which will handle all the errors that have not been handleed prior.
app.use((err, req, res, next)=>{
    let {statusCode=500, message="Some error occured!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
})





