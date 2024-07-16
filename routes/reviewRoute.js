const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isAuthor} = require("../middleware.js");

// -------- Reviews --------------

// We have to create an object of this new review coming from "form" and save it in review-model. Also we have to save this review in the array of "listing-model".
router.post("/", isLoggedIn, validateReview, wrapAsync(async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saved");
    // res.send("new review saved.");
    req.flash("success", "New review added!");
    res.redirect(`/listings/${listing._id}`);  
}))

// To delete a reivew.
router.delete("/:reviewId", isLoggedIn, isAuthor, wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    // Delete the review from listing model's review's array.
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // Delete the review from review model.
    await Review.findByIdAndDelete(reviewId);
    console.log("successful deletion");
    req.flash("success", "Review deleted Successfully!");
    res.redirect(`/listings/${id}`);
}))

// To delete a listing: Explained just above reviews.
// In this case, we have to delete all the reviews from Review model that are associated with that particular listing.
// Read Backend >> S10DatabaseRelationships if you find it difficult in understanding.

module.exports = router;