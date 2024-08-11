const mongoose = require('mongoose');
const {Schema} = mongoose;
const User = require("./user.js");
const Listing = require("./listing.js");
const reviewSchema = new Schema({
    comment: String, 
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing"
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;