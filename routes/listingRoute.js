const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");

//1.) Show all the listings/entries/hotels.
router.get("/", wrapAsync(listingController.index));   // wrapAsync is for unknown/unexpected error handling.

// ::: NOTE :::
// if you use API which is like "/listings/something", it will not work if it is after "/listings/:id" because listings/id will look for some id. So, always use them before it. Yeah if something related to "listing/id" is there then you can use after it as well.

//Always write /new above /:id, else /new will be treated as id which is not gonna find anytime.
router
.route("/new")
.get(isLoggedIn, listingController.renderNewForm) //2.) Create a new listing, render form.
.post(validateListing, wrapAsync(listingController.createANewListing)) //3.) To create a new listing.

router
.route("/:id")
.get(wrapAsync(listingController.showListing)) //4.) To show a listing in detail.
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)) //7.) To destroy a listing.

router
.route("/:id/edit")
.get(isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm)) // 5.) Showing form to Edit a listing:
.put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing)) //6.) update listing.

module.exports = router;


//2.) Create a new listing, render form.
// router.get("/new", isLoggedIn, listingController.renderNewForm);
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
// i) for that we have make change in the "form" of new.ejs, where the name is there we have to keep the name same as we have in our database collection properties. Also we have make then key's of an object name can be anything, like here x. So that we can directly access them.
// ii) we have used async-await at the place of .then, .catch. Also used try-catch.
// iii) Best way: used asyncWrap method. Combo of both above.

//3.) To create a new listing.
// router.post("/new", validateListing, wrapAsync(listingController.createANewListing));

//4.)
// Show page.
// Showing a particular listing in details on some other page.
// router.get("/:id", wrapAsync(listingController.showListing));

//Edit:
//5.) Showing form to Edit a listing:
// router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));
//6.) update listing.
// router.put("/:id/edit", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

//7.) Destroy/delete a Listing:
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


