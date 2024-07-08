const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const methodOverride = require("method-override"); // to make requests other than GET and POST.
const ejsMate = require("ejs-mate");     // Helps to create templates. 
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


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

app.get("/", (req, res)=>{
    res.send("You are in home directory");
})

// Show all the listings/entries/hotels.
app.get("/listings", wrapAsync(async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("index.ejs", {allListings});
}))

// ::: NOTE :::
// if you use API which is like "/listings/something", it will not work if it is after "/listings/:id" because listings/id will look for some id. So, always use them before it. Yeah if something related to "listing/id" is there then you can use after it as well.

// Create a new listing.
app.get("/listings/new", (req, res)=>{
    res.render("new.ejs");
})
// Way-1:
// app.post("/listings/new", (req, res)=>{
//     const formdata= req.body;
//     const newListing = new Listing({
//         title: formdata.title,
//         description: formdata.description,
//         price: formdata.price,
//         location: formdata.location,
//         country: formdata.country
//     })
//     newListing.save()
//     .then(()=>{console.log("Successfully saved");})
//     .catch(()=>{console.log("Some error in saving");})
//     res.redirect("/listings");
// })

// Way-2: Better
// i) for that we have make change in the "form" of new.ejs, where the name is there we have to keep the name same as we have in our database collection properties. Also we have make then key's of an object name can be anything, like here x. So that we can directly access them.
// ii) we have used async-await at the place of .then, .catch. Also used try-catch.
// iii) Best way: used asyncWrap method. Combo of both above.


const validateListing = (req, res, next)=>{
    const result = listingSchema.validate(req.body);  // Joi data-validation: 
        console.log(result);
        if(result.error){
                throw new ExpressError(400, result.error);
        }
        else
        {next();}
    
}

app.post("/listings/new", validateListing, wrapAsync(async(req, res)=>{
   
    //i) Not a modern thing to use .then(), .catch();
    // .then(()=>{
    //     console.log("Successfully saved");
    // }).catch(()=>{
    //     console.log("Some error while saving");
    // })


    //ii) Used async-await at the place of .then(), .catch(). Also used try-catch. 
    // try{
    //     const newListing = new Listing(req.body.x);
    //     await newListing.save();
    //     res.redirect("/listings");
    // }
    // catch(err){
    //     res.send("Some error occured");s
    // }


    // iii) best way. async-await + error handling.
    console.log(req.body);
    // if(!req.body.x){
    //     throw new ExpressError(400, "Send valid data for listing");
    // }


    // ::: Better way ::::
        // const result = listingSchema.validate(req.body);  // Joi data-validation: 
        // console.log(result);
        // if(result.error){
        //         throw new ExpressError(400, result.error);
        // }

    // ::::: More better way using middleware. ::::::
        const newListing = new Listing(req.body.x);
        await newListing.save();
        res.redirect("/listings");
    // Now if it throws some error it will go to error handling middleware.
}))



// Showing a particular listing in details on some other page.
app.get("/listings/:id", wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("show.ejs", {listing});

}))


// Edit a listing:
app.get("/listings/:id/edit", wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listingdata = await Listing.findById(id);
    res.render("edit.ejs", {listingdata});
}))
app.put("/listings/:id/edit", validateListing, wrapAsync(async (req, res)=>{
    let {id} = req.params;
    // Already we have set "required" on frontend, still we are adding 1-more layer for error handling, that it may happen that someone send some empty request using hopscotch/postman etc.
    // if(!req.body.x)
    // {
    //    throw new ExpressError(400, "Send valid data for listing");
    // }
    // await Listing.findByIdAndUpdate(id, req.body.x);  way-1
    await Listing.findByIdAndUpdate(id, {...req.body.x}); // way-2
    console.log("Successfully updated");
    res.redirect(`/listings/${id}`);
}))


// Delete a Listing:
app.delete("/listings/:id", wrapAsync(async(req, res)=>{
    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);   // This will send the request to "findOneAndDelete" mongoose-middleware. And, this middleware definition must be present just-below the schema which is calling this findbyIdandDelete method. So, here listing-schema. Because on the basis of listing we will find and delete something. But the listing schema is not present in app.js, we are importing it. So, we have to write this mongoose-middleware inside "models >> listing.js".
    console.log("Item deleted");
    // console.log(deletedListing);
    res.redirect("/listings");
}))



// -------- Reviews --------------
// Post reviews route.

// Server side validation:
const validateReview = (req, res, next)=>{
    console.log("Before validation review: ");
    console.log(req.body);
    const result = reviewSchema.validate(req.body);  // Joi data-validation: 
        console.log(result);
        if(result.error){
                throw new ExpressError(400, result.error);
        }
        else
        {next();}
    
}


// We have to create an object of this new review coming from "form" and save it in review-model. Also we have to save this review in the array of "listing-model".
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saved");
    // res.send("new review saved.");
    res.redirect(`/listings/${listing._id}`);  
}))

// To delete a reivew.
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    // Delete the review from listing model's review's array.
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // Delete the review from review model.
    await Review.findByIdAndDelete(reviewId);
    console.log("successful deletion");
    res.redirect(`/listings/${id}`);
}))

// To delete a listing: Explained just above reviews.
// In this case, we have to delete all the reviews from Review model that are associated with that particular listing.
// Read Backend >> S10DatabaseRelationships if you find it difficult in understanding.



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







