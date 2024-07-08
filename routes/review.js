const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");

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
router.post("/", validateReview, wrapAsync(async(req, res)=>{
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
router.delete("/:reviewId", wrapAsync(async(req, res)=>{
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

module.exports = router;