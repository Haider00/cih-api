const { mysqlConnection } = require("../utils/connection");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const updatePass = (req, res) => {
  try {
    const { email, password } = req.body;

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
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        mysqlConnection.query(
          "UPDATE user SET password_hash = ?, verified_email = ?, auth_key = ? WHERE email = ?",
          [hashedPassword, "true", token, email],
          async (updateError) => {
            if (updateError) {
              console.log("updateError", updateError);
              return res
                .status(500)
                .send("Error updating password and verifying email.");
            }

            res.status(200).send("Password updated.");
          }
        );
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("An error occurred.");
  }
};
module.exports = updatePass;
