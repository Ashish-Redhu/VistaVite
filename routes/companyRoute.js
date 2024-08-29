const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, validateContactForm} = require("../middleware.js");
const companyController = require("../controllers/company.js");
router.get("/about", wrapAsync(companyController.aboutCompany));
router
.route("/contact")
.get(isLoggedIn, wrapAsync(companyController.contactCompanyGet))
.post(isLoggedIn, validateContactForm, wrapAsync(companyController.contactCompanyPost));

module.exports=router;
