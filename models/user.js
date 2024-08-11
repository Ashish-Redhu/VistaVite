const mongoose = require("mongoose");
const Listing = require("./listing");
// Importing models.
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String, 
        required: true
    },
    role: {
        type: String,
        enum: ["user", "owner"],
        required: true
    },
    listings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing"
        }
    ],
    // Here we don't need to define "username" and "password" by ourself, because passport-local-mongoose will automatically add these fields along with "salting" and "hashing". Passport will add various methods as well in the Schema/class/collection/model/object/document. 
});

userSchema.plugin(passportLocalMongoose); // We have added this plugin with our schema, because this plugin will do all the things mentioned above (salting, hashing, authentication(signup, login), adding various other necessary fields etc.)

const User = mongoose.model("User", userSchema); // Created the model/class. 
module.exports = User;



