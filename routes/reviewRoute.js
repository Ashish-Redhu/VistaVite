const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
// const Review = require("../models/review.js");
// const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// -------- Reviews --------------

//1.) To create a new review.
// We have to create an object of this new review coming from "form" and save it in review-model. Also we have to save this review in the array of "listing-model".
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//2.) To delete a reivew.
router.delete("/:reviewId", isLoggedIn, isAuthor, wrapAsync(reviewController.destroyReview));

// To delete a listing: Explained just above reviews.
// In this case, we have to delete all the reviews from Review model that are associated with that particular listing.
// Read Backend >> S10DatabaseRelationships if you find it difficult in understanding.

module.exports = router;