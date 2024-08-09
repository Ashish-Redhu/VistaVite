const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const companyController = require("../controllers/company.js");
router.get("/about", wrapAsync(companyController.aboutCompany));

module.exports=router;
