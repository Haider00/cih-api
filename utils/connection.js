const mysql = require('mysql');
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cih_db',
    multipleStatements: true
});

mysqlConnection.connect(function (error) {
    if (error) {
        console.log(error)
    } else {
        console.log('Connection successful');
    }
})
module.exports.mysqlConnection = mysqlConnection;
