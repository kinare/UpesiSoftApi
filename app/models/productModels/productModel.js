let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
});

// Get all products
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

// Add sub-products
exports.addSubProductList = function(subProductList = null, callback) {
    let sql = "INSERT INTO ?? (??) VALUES ?";

    let inserts = ['subProductList', ['primaryProductId','measurement','measurementUnit','state','createdAt','updatedAt'], subProductList];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: 'There was an error inserting the sub-product list.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });
}

exports.getMeasurementUnits = function(callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ?";
    
    let inserts = ['measurementUnits', 'state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the measurement units list.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No measurement units exists
                callback({
                    error: true,
                    text: 'There were no measurement units found.'
                })
            }
        }
    });
}

exports.insertProductCategory = function(categoryData, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['productCategories', categoryData];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: 'There was an error inserting the new category.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });
}

exports.getAllCategories = function(businessId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['productCategories', 'businessId', businessId, 'state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the product categories list.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No products exists
                callback({
                    error: true,
                    text: 'There were no products categories found.'
                })
            }
        }
    });
}
