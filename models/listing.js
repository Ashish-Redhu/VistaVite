const mongoose = require("mongoose");
const Review = require("./review");
const User = require("./user");
const Schema = mongoose.Schema;

// Here no need to make a connection with database, because here we are simply making a new Schema(structure for a particular collection) and assigning that schema to a particular collection and then exporting that collection/model. Here we are not inserting anything in database or any other CRUD operation. We will importing this model/collection inside some other JS file where we have already build connection with mongoDB with the help of mongoose and there we will perform CRUD operations. We are importing mongoose so that we can define a schema. You know mongoose have two work (i) making connection of backend.js file with mongodb and (ii) defining schema.

const listingSchema = new Schema({
    title:{
        type: String, 
        required: true
    },
    description: String, 
    image: {
        url: String, 
        filename: String
    },
    price: Number,
    location: String, 
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
});
// So, image property me kya kiya ke bhai agar koi bhi value provided nahi hoti h to default value dal do image me. Else agar koi value "v" provide hoti hai, to usse return kar do.

// Mongoose-middleware "findOneAndDelete" which would trigger when we try to delete a listing. We are writing this middleware because we want to perform some extra task after deletion of listing and that task is deletion of all the reviews in review model that are associated with this listing.
listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing.reviews.length >0)
    {
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
    
})
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
