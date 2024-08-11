// All the controllers/functions related to listings will reside here. 
const Listing = require("../models/listing.js");    // Here we have required the model of listing to perform CRUD.
const Review = require("../models/review.js");
const User = require("../models/user.js");

// The below 3-things are for using geoCoding of mapbox. 
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

//1.)  This is for showing all the listings.
module.exports.index = async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("../views/listings/index.ejs", {allListings});
}

//2.)  This is for rendering a form to create a new listing.
module.exports.renderNewForm = (req, res)=>{
    // This isLoggedIn is working as a middleware. 
    res.render("../views/listings/new.ejs");
}

// 3.) To create a new listing.
module.exports.createANewListing = async(req, res)=>{
    // This is for maps location to coordinates converter. 
    let response = await geocodingClient.forwardGeocode({
        query: req.body.x.location,   // This will take input from our form location. 
        limit: 1                      // This limit:1 means it will show only a single pair of longitue, latitude.
      })
        .send();
// console.log(response.body.features[0].geometry);
   
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

    /* 2.
    console.log(req.body);
    */

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
    
        // url and filename we will get from the image we are storing on Cloudinary. 
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.x);
        newListing.image = {url, filename};
        newListing.owner = req.user._id;    // Storing the owner as well with each listing.
        newListing.geometry = response.body.features[0].geometry; // Storing the geoCoordinates of location entered by user. The location has been converted to Geocoordinates by upper give code of MapBox already. 
        let savedListing =  await newListing.save();
        console.log("----- ", savedListing);
        // connect-flash to show a pop-up message after saving a listing. Here, we simply create that flash(pop-up message with a key) but how we will show it is defined somewhere else. 
        
        res.locals.currUser.listings.push(savedListing._id);
        // Optionally, save the updated user if needed
        await res.locals.currUser.save();

        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    // Now if it throws some error it will go to error handling middleware.
}


//4.) This is for showing a particular listing in detail.
module.exports.showListing = async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");

    // populate simply expands the thing. We use populate whenever we are storing the objectId of another model and want to use this inside object's properties like names, links etc. 
    // connect-flash to show a pop-up error message if someone try to access a listing which doesn't exist. He/she may try to access with the help of link. 
    // populate on the basis of "owner" to store who is the owner of this listing. populate on the basis of "reviews" to show all the reviews. populate on the basis of "author" to store the name of owner of each review.

    if(!listing)
    {
        req.flash("error", "Listing you have request for doesn't exist.");
        res.redirect("/listings");
    }
    res.render("show.ejs", {listing});

}

//5.) Show edit form.
module.exports.renderEditForm = async (req, res)=>{
    const {id} = req.params;
    const listingdata = await Listing.findById(id);
    if(!listingdata)
    {
            req.flash("error", "Listing you have request for doesn't exist.");
            return res.redirect("/listings");
    }
    // Authentication of loggedin before edit. 
    // if(!req.isAuthenticated())
    //         {
    //             req.flash("error", "You must be loggedin to create a new listing");
    //             return res.redirect("/login");
    //         }
    let originalImageUrl = listingdata.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("../views/listings/edit.ejs", {listingdata, originalImageUrl});
}

//6.) To finally update the listing.
module.exports.updateListing = async (req, res)=>{
    let {id} = req.params;
    // Already we have set "required" on frontend, still we are adding 1-more layer for error handling, that it may happen that someone send some empty request using hopscotch/postman etc.
    // if(!req.body.x)
    // {
    //    throw new ExpressError(400, "Send valid data for listing");
    // }
    // await Listing.findByIdAndUpdate(id, req.body.x);  way-1
    let tempListing = await Listing.findByIdAndUpdate(id, {...req.body.x}); // way-2
    if(typeof req.file != "undefined")
    {
        let url = req.file.path;
        let filename = req.file.filename;
        tempListing.image = {url, filename};
        await tempListing.save();
    }
    
    console.log("Successfully updated");
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

//7.) Destroy/delete listing.
module.exports.destroyListing = async(req, res)=>{
    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);   // This will send the request to "findOneAndDelete" mongoose-middleware. And, this middleware definition must be present just-below the schema which is calling this findbyIdandDelete method. So, here listing-schema. Because on the basis of listing we will find and delete something. But the listing schema is not present in app.js, we are importing it. So, we have to write this mongoose-middleware inside "models >> listing.js".
    res.locals.currUser.listings = res.locals.currUser.listings.filter(obj => obj._id != deletedListing._id);
     // Delete all reviews associated with the listing
     await Review.deleteMany({ listing: id }); 
    console.log("Item deleted");
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};









