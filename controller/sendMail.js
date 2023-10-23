const { mysqlConnection } = require("../utils/connection");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const sendMail = (req, res) => {
  console.log("body", req.body);
  try {
    const {
      username = "",
      full_name,
      date_of_birth,
      country,
      newsletter = "",
      password_hash,
      password_reset_token = "",
      email,
      status = "",
      admob_status,
    } = req.body;

    // Create a Unix timestamp
    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    // Check if email already exists
    mysqlConnection.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      async (error, result) => {
        if (error) {
          throw new Error("Error checking email");
        }

        if (result.length > 0) {
          return res.status(200).send({ message: "Email already exists" });
        } else {
          let mailTransporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASS,
            },
          });

          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          const otp_time = new Date();

          let details = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Verification Email",
            text: `Verify your email by entring this otp ${otp}`,
          };

          mailTransporter.sendMail(details, (err) => {
            if (err) {
              console.log("There is an error ", err);
            } else {
              console.log("Email has sent");
            }
          });
          const salt = await bcrypt.genSalt(10);
          const hashPass = await bcrypt.hash(password_hash, salt);

          const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });

          const insertQuery = `
            INSERT INTO user (username, full_name, date_of_birth, country, newsletter, auth_key, password_hash, password_reset_token, email, status, admob_status, created_at, updated_at, otp, otp_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const values = [
            username,
            full_name,
            date_of_birth,
            country,
            newsletter,
            token,
            hashPass,
            password_reset_token,
            email,
            status,
            admob_status,
            unixTimestamp,
            unixTimestamp,
            otp,
            otp_time,
          ];

          mysqlConnection.query(
            insertQuery,
            values,
            (insertError, insertResult) => {
              if (insertError) {
                throw new Error("Error signing up");
              }
              res.status(200).send({
                message: "Signed up successfully, please verify your email",
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(200).send("Something Went Wrong, Try Again Later");
  }
};
module.exports = sendMail;
