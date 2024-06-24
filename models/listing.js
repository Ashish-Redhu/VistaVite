const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Here no need to make a connection with database, because here we are simply making a new Schema(structure for a particular collection) and assigning that schema to a particular collection and then exporting that collection/model. Here we are not inserting anything in database or any other CRUD operation. We will importing this model/collection inside some other JS file where we have already build connection with mongoDB with the help of mongoose and there we will perform CRUD operations. We are importing mongoose so that we can define a schema. You know mongoose have two work (i) making connection of backend.js file with mongodb and (ii) defining schema.

const listingSchema = new Schema({
    title:{
        type: String, 
        required: true
    },
    description: String, 
    image: {
        type: String,

        default: "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHJhdmVsJTIwaG90ZWx8ZW58MHx8MHx8fDA%3D",
        set: function(v) {
            return v || this.default;
        }
    },
    price: Number,
    location: String, 
    country: String
})
// So, image property me kya kiya ke bhai agar koi bhi value provided nahi hoti h to default value dal do image me. Else agar koi value "v" provide hoti hai, to usse return kar do.

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
