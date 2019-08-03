let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})

exports.uploadUserImage = function(userDetails, callback) {

}

exports.uploadProductImage = function(userDetails, callback) {
    
}

exports.uploadCustomerImage = function(userDetails, callback) {
    
}
