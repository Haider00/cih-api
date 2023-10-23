const express = require("express");
const { mysqlConnection } = require("../utils/connection");

const verifyOtp = (req, res) => {
  try {
    const { email_address, otp } = req.body;

    mysqlConnection.query(
      "SELECT otp, otp_time FROM user WHERE email = ?",
      [email_address],
      (error, results) => {
        if (error) {
          console.error("Database query error:", error);
          throw new Error("Error fetching OTP from database");
        }

        if (results.length === 0) {
          return res.status(404).send("User not found.");
        }

        const dbOtp = String(results[0].otp).trim();
        const otpGenerationTime = results[0].otp_time;

        const currentTime = new Date();
        const otpGenerationDate = new Date(otpGenerationTime);
        const timeDiffInMinutes = (currentTime - otpGenerationDate) / 60000;

        if (timeDiffInMinutes > 1) {
          return res
            .status(200)
            .send("OTP has expired. Please request a new one.");
        } else if (String(otp).trim() !== dbOtp) {
          return res.status(200).send("Invalid OTP.");
        } else {
          mysqlConnection.query(
            "UPDATE user SET verified_email = true WHERE email = ?",
            [email_address],
            (updateError, results) => {
              if (updateError) {
                console.error("Error while updatingr database:", updateError);
                return res
                  .status(500)
                  .send("Error updating email verification status.");
              }

              if (results.affectedRows === 0) {
                return res
                  .status(404)
                  .send("No matching user found for the provided email.");
              }
              res.status(200).send("Email verified successfully.");
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("An error occurred.");
  }
};

module.exports = verifyOtp;
