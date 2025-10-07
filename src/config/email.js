const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:"gmail", // yaha koi bhi smtp service
    auth:{
        user:process.env.EMAIL_USER, // Gmail address
        pass:process.env.Email_PASS //App password /SMTP password
    },
});
module.exports = transporter; 