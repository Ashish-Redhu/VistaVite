const Listing = require("./models/listing.js");
const { listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");

// Remember these "listingSchema and reviewSchema" are not the actual schemas of "listing and review" but the schemas of Joi.

// ****** Middlewares for listing ******

module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated())    // this is passport method that automatically fetch details and check that in this session the user that is making request is logged in or not. 
    {   
        const originalUrlParts = req.originalUrl.split('/'); // req contain lot of things, here "originalUrl" contains the complete path where user requested for. 
        const listingId = originalUrlParts[2];
        req.session.redirectUrl = `listings/${listingId}`;
        console.log(req.session.redirectUrl);
        req.flash("error", "You must be loggedin to perform operations.");
        return res.redirect("/login");
    }
    else
    {console.log("User already loggedIn.")}
    next();
}
// Original url is stored into "session's variable". But when user will login it will not be able to go back to "add new listing" or the path he requested earlier, because the previous session will be deleted and a new session will generate. That is why we stored it in "local variable". 
module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// Check current loggedIn user is the Owner of a particular property he has selected.
module.exports.isOwner = async (req, res, next)=>{
    // Finding the details of current listing selected by user. 
   let {id} = req.params;
   let listing = await Listing.findById(id);
   if(!listing.owner.equals(res.locals.currUser._id)) 
   {
      req.flash("error", "Only owners can make changes!");
      return res.redirect(`/listings/${id}`);
   }
   next();
}

module.exports.validateListing = (req, res, next)=>{
    const result = listingSchema.validate(req.body);  // Joi data-validation: 
        console.log(result);
        if(result.error){
                throw new ExpressError(400, result.error);
        }
        else
        {next();}
}


// ****** Middlewares for Reviews ******
// Server side validation:
module.exports.validateReview = (req, res, next)=>{
    console.log("Before validation review: ");
    console.log(req.body);
    const result = reviewSchema.validate(req.body);  // Joi data-validation: 
        console.log(result);
        if(result.error){
                throw new ExpressError(400, result.error);
        }
        else
        {next();}
    
}

module.exports.isAuthor = async (req, res, next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    console.log("The review is: ");
    console.log(review);
    if(!review.author.equals(req.user._id))
    {
        req.flash("error", "Review can be deleted by it's author only !")
        return res.redirect(`/listings/${id}`)
    }
    next();
}





