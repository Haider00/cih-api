const { mysqlConnection } = require("../utils/connection");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const forgetPassword = async (req, res) => {
  try {
    const { email_address } = req.body;
    console.log(req.body);
    const otp = generateOTP();

    mysqlConnection.query(
      "UPDATE user SET otp = ?, otp_time = NOW() WHERE email = ?",
      [otp, email_address],
      async (updateError) => {
        if (updateError) {
          return res.status(500).send("Error updating OTP.");
        }

        let mailTransporter = nodemailer.createTransport({
          service: process.env.SERVICE,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });

        let mailDetails = {
          from: process.env.EMAIL,
          to: email_address,
          subject: "OTP for Password Reset",
          text: `Your OTP is: ${otp}`,
        };

        mailTransporter.sendMail(mailDetails, (mailError) => {
          if (mailError) {
            console.log(">>>>>>", mailError);
            return res.status(500).send("Error sending email.");
          }
          res.status(200).send({ message: "OTP sent successfully." });
        });
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("An error occurred.");
  }
};

module.exports = forgetPassword;
