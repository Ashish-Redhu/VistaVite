const express = require("express");
const router = express.Router();

router.get("/qr", (req,res)=>{
    res.render("payment/qr.ejs");
})
module.exports=router;