let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
});

exports.uploadUserImage = function(userDetails, callback) {

}

exports.uploadProductImage = function(userDetails, callback) {
    
}

exports.uploadCustomerImage = function(userDetails, callback) {
    
}
