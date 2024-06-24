const mongoose = require("mongoose");
const iniData = require("./data.js");
const Listing = require("../models/listing.js");
// Connecting with database 'wanderlust'
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
.then(()=>{
    console.log("Connected to database wanderlust");
})
.catch((err)=>{
    console.log("Some error in connection", err);
})

Listing.insertMany(iniData.data)
.then(()=>{
    console.log("inserted multiple entries successfully.");
})
.catch((err)=>{
    console.log("Some error while inserting", err);
})

