var mysql = require('mysql');

var con = mysql.createPool({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    dateStrings : 'date',
    charset : 'utf8mb4',
});
module.exports = con;