const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../controller/sendMail");
const verifyOtp = require("../controller/verifyOtp");
const resendOtp = require("../controller/resendOtp");
const updatePass = require("../controller/updatePass");
const forgetPassword = require("../controller/forgetPassword");
require("dotenv").config();

router.post("/signup", sendMail);
router.post("/verify/otp", verifyOtp);
router.post("/resend/otp", resendOtp);
router.post("/updatePass", updatePass);
router.post("/forgetPassword", forgetPassword);

router.patch("/user/:userId", (req, res) => {
  const userId = req.params.userId;
  const {
    username,
    full_name,
    date_of_birth,
    country,
    newsletter,
    auth_key,
    email,
    admob_status,
  } = req.body;

  const selectQuery = `
        SELECT * FROM user WHERE id = ?
    `;
  const date = new Date();
  const selectValues = [userId];
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  mysqlConnection.query(
    selectQuery,
    selectValues,
    function (error, selectResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error fetching user data");
      } else {
        if (selectResult.length === 0) {
          res.status(404).send("User not found");
        } else {
          const existingData = selectResult[0];

          let updateQuery = `UPDATE user SET `;
          const values = [];

          const updateField = (field, value) => {
            if (value !== undefined) {
              updateQuery += `${field} = ?, `;
              values.push(value);
            }
          };
          updateField("username", username);
          updateField("full_name", full_name);
          updateField("date_of_birth", date_of_birth);
          updateField("country", country);
          updateField("newsletter", newsletter);
          updateField("auth_key", auth_key);
          updateField("email", email);
          updateField("admob_status", admob_status);
          updateField("updated_at", unixTimestamp);

          updateQuery = updateQuery.slice(0, -2);

          updateQuery += " WHERE id = ?";
          values.push(userId);

          mysqlConnection.query(
            updateQuery,
            values,
            function (error, updateResult) {
              if (error) {
                console.log(error);
                res.status(500).send("Error updating user");
              } else {
                if (updateResult.affectedRows === 0) {
                  res.status(404).send("User not found");
                } else {
                  console.log("User updated successfully");
                  res.status(200).send("User updated successfully");
                }
              }
            }
          );
        }
      }
    }
  );
});

router.delete("/user/:userId", (req, res) => {
  const userId = req.params.userId;

  const deleteQuery = `
        DELETE FROM user
        WHERE id = ?
    `;
  const values = [userId];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting user");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("User not found");
      } else {
        console.log("User deleted successfully");
        res.status(200).send("User deleted successfully");
      }
    }
  });
});

router.post("/login", (req, res) => {
  const { email, password_hash } = req.body;

  const selectQuery = `
        SELECT id, email, username, password_hash, verified_email FROM user WHERE email = ?
    `;
  const selectValues = [email];

  mysqlConnection.query(selectQuery, selectValues, async (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching user data");
    } else {
      if (result.length === 0) {
        console.log("user no", user);
        res.status(200).send({ message: "User not found" });
      } else {
        const user = result[0];

        const isPasswordValid = await bcrypt.compare(
          password_hash,
          user.password_hash
        );
        if (isPasswordValid) {
          const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          const updateTokenQuery = `
            UPDATE user SET auth_key = ? WHERE id = ?
          `;
          const updateTokenValues = [token, user.id];

          mysqlConnection.query(
            updateTokenQuery,
            updateTokenValues,
            (updateError) => {
              if (updateError) {
                console.log(updateError);
                res.status(500).send("Error updating user token");
              } else {
                console.log({ accessToken: token, user });
                res.status(200).json({ accessToken: token, user });
              }
            }
          );
        } else if (!isPasswordValid && user.verified_email == "false") {
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          const otp_time = new Date();
          let mailTransporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASS,
            },
          });

          let details = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Verification Email",
            text: `Verify your emai by entring this otp ${otp}`,
          };

          mailTransporter.sendMail(details, (err) => {
            if (err) {
              console.log("There is an error ", err);
            } else {
              console.log("Email has sent");
            }
          });
          mysqlConnection.query(
            "SELECT * FROM user WHERE email = ?",
            [user.email],
            async (error, result) => {
              if (error) {
                throw new Error("Error checking email");
              }

              const updateQuery = `UPDATE user SET otp = ?, otp_time = ? WHERE email = ?`;
              const values = [otp, otp_time, user.email];

              mysqlConnection.query(
                updateQuery,
                values,
                (updateError, updateResult) => {
                  console.log("insertError", updateError, updateResult);
                  if (updateError) {
                    throw new Error("Error signing up", updateError);
                  }
                  res.status(200).send({ message: "Verify your email" });
                }
              );
            }
          );
        } else {
          res.status(200).send({ message: "Invalid email or password" });
        }
      }
    }
  });
});

module.exports = router;
