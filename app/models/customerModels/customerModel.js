let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})

// Get all customers
exports.getAll = function(businessId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['customers', 'businessId', businessId, 'state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the customer list.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No customers exists
                callback({
                    error: true,
                    text: 'There were no customers found.'
                })
            }
        }
    });
}

// Add new customer
exports.addNew = function(insertData = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['customers', insertData];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: 'There was an error inserting the customer details.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });    
}

// Delete customer
exports.deleteCustomer = function(updateVariables, updateData, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ? AND ?? = ?";

    let inserts = ['customers', updateData, 'id', updateVariables['id'], 'businessId', updateVariables['businessId']];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            // throw error
            callback(false)
        } else {
            callback(results)
        }
    });
}

// Run customer update
exports.updateCustomer = function(updateVariable = null, updateData = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ?";

    let inserts = ['customers', updateData, updateVariable['name'], updateVariable['value']];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            // throw error
            callback({
                error: 'true', 
                text: error.sqlMessage ? error.sqlMessage : 'There was an error updating customer details.',
                sqlMessage: error.sqlMessage ? error.sqlMessage : null
            })
        } else {
            callback(results)
        }
    });
}
