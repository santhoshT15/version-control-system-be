const nodemailer = require("nodemailer");

exports.sendEmail = async (email, subject, payload) => {
  try {
    var transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ramsanthoshbms@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    var mailOptions = {
      from: "ramsanthoshbms@gmail.com",
      to: email,
      subject: subject,
      text: JSON.stringify(payload),
    };
    await transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error while sending Email: ", err);
        return false;
      }
      return true;
    });
  } catch (error) {
    console.log("Error in sendEmail(): ", error);
    return false;
  }
};