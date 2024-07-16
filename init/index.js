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

const inDB = async ()=>{
    await Listing.deleteMany({});
    iniData.data = iniData.data.map((obj)=>{
       return({...obj, owner: "6695fd2635ce9481f7719db1"});
    })
    await Listing.insertMany(iniData.data);
}
// ?? Here we have simply associated a single owner initially with all the properties. 
// iniData is simply that file. iniData.data is the array of objects. 
// Note: map always create a new array, which adds/remove something from the elements of previous array. 
inDB();
