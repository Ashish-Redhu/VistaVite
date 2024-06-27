const Joi = require("joi");

// Here name can be anything at the place of "listingSchema". Here we are defining a struture/schema for Joi, along with some conditions that must be same as data send by user.
const listingSchema = Joi.object({

    // Here name must be "x", because this is the same name we have used in the form naming of input tags.
      x : Joi.object({
       title: Joi.string().required(),
       description: Joi.string().required(),
       location: Joi.string().required(),
       country: Joi.string().required(),
       price: Joi.number().required().min(0),
       image: Joi.string().allow("", null),
      }).required(),
      // This outer required-condition is to check that the complete object should be there. Means it should not be like someone send completely empty object or doesn't send object.

});
module.exports = {listingSchema};