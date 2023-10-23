const { mysqlConnection } = require("../utils/connection");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

const resendOtp = (req, res) => {
  try {
    const { email } = req.body;

    mysqlConnection.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          return res.status(500).send("Error fetching user.");
        }

        if (results.length === 0) {
          return res.status(404).send("User not found.");
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        mysqlConnection.query(
          "UPDATE user SET otp = ?, otp_time = NOW() WHERE email = ?",
          [otp, email],
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
              to: email,
              subject: "Resend Verification OTP",
              text: `Your new OTP is: ${otp}`,
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
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("An error occurred.");
  }
};
module.exports = resendOtp;
