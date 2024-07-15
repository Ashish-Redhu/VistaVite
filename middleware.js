module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated())    // this is passport method that automatically fetch details and check that in this session the user that is making request is logged in or not. 
    {   
        req.session.redirectUrl = req.originalUrl; // req contain lot of things, here "originalUrl" contains the complete path where user requested for. 
        req.flash("error", "You must be loggedin to create a new listing");
        return res.redirect("/login");
    }
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
