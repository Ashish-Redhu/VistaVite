const Contact = require('../models/contact');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASS   // Your email password (you might need to use an app-specific password)
    }
});
// Remember this email will sent message to our email we will provide ahead. But this is not the email of user. This email send message to our email on behalf of user. 


module.exports.aboutCompany=(req, res)=>{
    res.render("../views/company/about.ejs");
}
module.exports.contactCompanyGet=(req, res)=>{
    res.render("../views/company/contact.ejs");
}

module.exports.contactCompanyPost = async (req, res) => {
    const { firstname, lastname, email, phoneNumber, subject, description, contactMethod, urgency } = req.body;
  
    try {
      // Validation (you can add more validation logic as needed)
      if (!firstname || !email || !phoneNumber || !subject || !description || !contactMethod || !urgency) {
        req.flash("error", "Mendatory fields cannot be empty!");
        return res.status(400).send('Mendatory fields cannot be empty!');
      }
  
      // Save to MongoDB
      const contact = new Contact({ firstname, lastname, email, phoneNumber, subject, description, contactMethod, urgency });
      await contact.save();


       // Send an email
    const mailOptions = {
        from: email, // The user's email address
        to: process.env.RECEIVER_EMAIL, // The fixed recipient email address
        subject: `New Contact Form Submission: ${subject}`,
        text: `You have received a new inquiry from ${firstname} ${lastname}.
        
        Details:
        - Email: ${email}
        - Phone Number: ${phoneNumber}
        - Subject: ${subject}
        - Description: ${description}
        - Preferred Contact Method: ${contactMethod}
        - Urgency: ${urgency}

        Please respond to the inquiry at your earliest convenience.`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent:', info.response);
        res.status(200).send("Contact form submitted successfully");
    });
    
      // Redirect to a success page or send a response
      req.flash("success", "Email sent to the company. We'll follow up soon.!");
      res.redirect('/listings'); // Ensure you have a success page set up
    } catch (err) {
      console.error(err);
      req.flash("error", "Server Error");
      res.status(500).send('Server Error');
    }
}