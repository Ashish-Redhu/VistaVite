const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override"); // to make requests other than GET and POST.
const ejsMate = require("ejs-mate");     // Helps to create templates. 
// const wrapAsync = require("./utils/wrapAsync.js"); // Because now it is not in use.
const ExpressError = require("./utils/ExpressError.js");
const listing = require("./routes/listing.js");
const review = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");

// Setting up an express app.
const app = express();
const PORT = 9000;
app.listen(PORT, ()=>{
    console.log(`Server is listening on http://localhost:${PORT}`);
})

// This is for telling to NodeJS, "hey, view engine is ejs. So, Node view engine(ejs) will look for views in the view folder whose path we set in second line."
app.set("view engine", "ejs");


// app.set("views", path.join(__dirname, "./views/listings")); // We are telling ki bhai apne jo views/ejs files h wo ejs >> listings ke ander h. 
// We have done this because it may happen in future we have to create some views for a particular user or something like that then we will create in seperate folder inside "views".
// app.set("views", path.join(__dirname, "./views"));

// To set multiple views: 
app.set("views", [
    path.join(__dirname, "./views"),
    path.join(__dirname, "./views/listings")
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


// Include session and cookies.
const sessionOptions = {
    secret: "mysupersecretkey", // we will change it later.
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

// Here we stored the message of "success" flash in local variable named as "success", this local variable is in middleware so will be accessible by all the pages. 
app.use((req, res, next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    console.log(res.locals.successMsg);
    console.log(res.locals.errorMsg);
    next();
})


app.get("/", (req, res)=>{
    res.send("You are in home directory");
})

app.use("/listings", listing);
app.use("/listings/:id/reviews", review);



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



// Connecting with database 'wanderlust'
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
.then(()=>{
    console.log("Connected to database wanderlust");
})
.catch((err)=>{
    console.log("Some error in connection", err);
})



