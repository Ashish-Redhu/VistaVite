const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

//1.) To create a new review.
module.exports.createReview = async(req, res)=>{
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
}

// 2.) To destroy/delete a review.
module.exports.destroyReview = async(req, res)=>{
    let {id, reviewId} = req.params;
    // Delete the review from listing model's review's array.
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // Delete the review from review model.
    await Review.findByIdAndDelete(reviewId);
    console.log("successful deletion");
    req.flash("success", "Review deleted Successfully!");
    res.redirect(`/listings/${id}`);
}



