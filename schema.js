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
      facilities: Joi.array().items(Joi.string()).default([]),
      // This outer required-condition is to check that the complete object should be there. Means it should not be like someone send completely empty object or doesn't send object.

});

const reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
})

// Contact Form Schema
const contactSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().allow('', null), // Optional field
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid 10-digit number."
    }),
  subject: Joi.string().required(),
  description: Joi.string().required(),
  contactMethod: Joi.string().valid('email', 'phone').required(),
  urgency: Joi.string().valid('urgent', 'normal', 'notUrgent').required(),
});

module.exports = {listingSchema,reviewSchema, contactSchema};

// We can exports in some other way as well. like "module.exports.reviewSchema" to directly export, then no need of this last line "module.exports = {listingSchema,reviewSchema};"

// Here remember one thing, jo ye chojon ke naam h ye same hone chahiye jo ki apne actual database wale model ke ander names h, because overall to jo chijein user send kar rha h unhe humein inse compare karke ki sahi send data h ki nahi at the end database ke ander store karwana h. Ye to bas bich mein aik validation ke liye h. Haan, jo "review" name h, wo wahi same name hoga, jo frotend user ke input elements ke name mein use kiya gya tha. 


