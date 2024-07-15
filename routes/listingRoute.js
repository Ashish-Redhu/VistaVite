const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema} = require("../schema.js");
const {isLoggedIn} = require("../middleware.js");

// Show all the listings/entries/hotels.
router.get("/", wrapAsync(async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("index.ejs", {allListings});
}))

// ::: NOTE :::
// if you use API which is like "/listings/something", it will not work if it is after "/listings/:id" because listings/id will look for some id. So, always use them before it. Yeah if something related to "listing/id" is there then you can use after it as well.

// Create a new listing.
router.get("/new", isLoggedIn, (req, res)=>{
    // This isLoggedIn is working as a middleware. 
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

router.post("/new", validateListing, wrapAsync(async(req, res)=>{
   
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

        // connect-flash to show a pop-up message after saving a listing. Here, we simply create that flash(pop-up message with a key) but how we will show it is defined somewhere else.
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    // Now if it throws some error it will go to error handling middleware.
}))



// Showing a particular listing in details on some other page.
router.get("/:id", wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    // connect-flash to show a pop-up error message if someone try to access a listing which doesn't exist. He/she may try to access with the help of link. 
    if(!listing)
    {
        req.flash("error", "Listing you have request for doesn't exist.");
        res.redirect("/listings");
    }
    res.render("show.ejs", {listing});

}))


// Edit a listing:
router.get("/:id/edit",isLoggedIn, wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const listingdata = await Listing.findById(id);
    if(!listingdata)
        {
            req.flash("error", "Listing you have request for doesn't exist.");
            res.redirect("/listings");
        }
        // Authentication of loggedin before edit. 
    // if(!req.isAuthenticated())
    //         {
    //             req.flash("error", "You must be loggedin to create a new listing");
    //             return res.redirect("/login");
    //         }
    res.render("edit.ejs", {listingdata});
}))
router.put("/:id/edit", isLoggedIn, validateListing, wrapAsync(async (req, res)=>{
    let {id} = req.params;
    // Already we have set "required" on frontend, still we are adding 1-more layer for error handling, that it may happen that someone send some empty request using hopscotch/postman etc.
    // if(!req.body.x)
    // {
    //    throw new ExpressError(400, "Send valid data for listing");
    // }
    // await Listing.findByIdAndUpdate(id, req.body.x);  way-1
    await Listing.findByIdAndUpdate(id, {...req.body.x}); // way-2
    console.log("Successfully updated");
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}))


// Delete a Listing:
router.delete("/:id", isLoggedIn, wrapAsync(async(req, res)=>{
    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);   // This will send the request to "findOneAndDelete" mongoose-middleware. And, this middleware definition must be present just-below the schema which is calling this findbyIdandDelete method. So, here listing-schema. Because on the basis of listing we will find and delete something. But the listing schema is not present in app.js, we are importing it. So, we have to write this mongoose-middleware inside "models >> listing.js".
    console.log("Item deleted");
    // console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}))


module.exports = router;

