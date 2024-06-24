const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override"); // to make requests other than GET and POST.
const ejsMate = require("ejs-mate");     // Helps to create templates. 

// Setting up an express app.
const app = express();
const PORT = 9000;
app.listen(PORT, ()=>{
    console.log(`Server is listening on http://localhost:${PORT}`);
})

// This is for telling to NodeJS, "hey, view engine is ejs. So, Node view engine(ejs) will look for views in the view folder whose path we set in second line."
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views/listings")); // We are telling ki bhai apne jo views/ejs files h wo ejs >> listings ke ander h. 
// We have done this because it may happen in future we have to create some views for a particular user or something like that then we will create in seperate folder inside "views".

// To make Node able to understand the data received in diff-diff formats that is availabe in "req.body";
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

// To use static files.
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

app.get("/", (req, res)=>{
    res.send("You are in home directory");
})

// Show all the listings/entries/hotels.
app.get("/listings", async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("index.ejs", {allListings});
})

// ::: NOTE :::
// if you use API which is like "/listings/something", it will not work if it is after "/listings/:id" because listings/id will look for some id. So, always use them before it. Yeah if something related to "listing/id" is there then you can use after it as well.

// Create a new listing.
app.get("/listings/new", (req, res)=>{
    res.render("new.ejs");
})
// Way-1:
// app.post("/listings/new", (req, res)=>{
//     const formdata= req.body;
//     const newListing = new Listing({
//         title: formdata.title,
//         description: formdata.description,
//         price: formdata.price,
//         location: formdata.location,
//         country: formdata.country
//     })
//     newListing.save()
//     .then(()=>{console.log("Successfully saved");})
//     .catch(()=>{console.log("Some error in saving");})
//     res.redirect("/listings");
// })
// Way-2: Better
// for that we have we have make change in the "form" of new.ejs, where the name is there we have to keep the name same as we have in our database collection properties. Also we have make then key's of an object name can be anything, like here x. So that we can directly access them.
app.post("/listings/new", (req, res)=>{
    const newListing = new Listing(req.body.x);
    newListing.save().then(()=>{
        console.log("Successfully saved");
    }).catch(()=>{
        console.log("Some error while saving");
    })
    res.redirect("/listings");
})



// Showing a particular listing in details on some other page.
app.get("/listings/:id", async (req, res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("show.ejs", {listing});

})


// Edit a listing:
app.get("/listings/:id/edit", async (req, res)=>{
    const {id} = req.params;
    const listingdata = await Listing.findById(id);
    res.render("edit.ejs", {listingdata});
})
app.put("/listings/:id/edit", async (req, res)=>{
    let {id} = req.params;
    // await Listing.findByIdAndUpdate(id, req.body.x);  way-1
    await Listing.findByIdAndUpdate(id, {...req.body.x}); // way-2
    console.log("Successfully updated");
    res.redirect(`/listings/${id}`);
})

// Delete a Listing:
app.delete("/listings/:id", async(req, res)=>{
    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Item deleted");
    // console.log(deletedListing);
    res.redirect("/listings");
})





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



// Ke bhai directly app aik nai entry create mat karna. Jaise hi koi iss url pe jaye "/listings" pe tabhi aik nayi listing kar dena.
// app.get("/listings", async(req, res)=>{
//     let newlisting = new Listing({
//         title: "Villa 1",
//         description: "Hello this is first villa.",
//         price: 1200,
//         location: "Delhi", 
//         country: "India"
//     })
//     await newlisting.save();
//     console.log("Sample saved");
//     res.send("sammple saved");
// })
// So that data doesn't insert again and again. This was for 1-time insertion checking.



