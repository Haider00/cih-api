const mysql = require("mysql");
require("dotenv").config();

var mysqlConnection = mysql.createConnection({
  host: process.env.LOCALHOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true,
});

mysqlConnection.connect(function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log("Connection successful");
  }
});
module.exports.mysqlConnection = mysqlConnection;
