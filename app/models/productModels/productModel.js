let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
});

exports.getAll = function(businessId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['products', 'businessId', businessId, 'state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the product list.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No products exists
                callback({
                    error: true,
                    text: 'There were no products found.'
                })
            }
        }
    });
}

// Add new product
exports.addNew = function(insertData = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['products', insertData];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: 'There was an error inserting the product.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });    
}
