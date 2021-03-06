let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})

// Register business
exports.register = function(insertData = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['businesses', insertData];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            callback(results)
        }
    });
}

// Get business by ID
exports.getBusinessById = function(id = null, callback) {
    let sql = "SELECT businesses.*, businessTypes.businessTypeName FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['businesses', 'businessTypes', 'businesses.businessTypeId', 'businessTypes.id', 'businesses.id', id, 'businesses.state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback(false)
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // There is no business with that ID
                callback(false)
            }
        }
    });
}

// Get business by ID
exports.getBusinesses = function(organizationId = null, callback) {
    let sql = "SELECT businesses.*, businessTypes.businessTypeName FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['businesses', 'businessTypes', 'businesses.businessTypeId', 'businessTypes.id', 'businesses.organizationId', organizationId, 'businesses.state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving organization businesses.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                callback({
                    error: true,
                    text: 'There were no businesses found.'
                })
            }
        }
    });
}

exports.update = function(businessId = null, updateDetails = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ?";

    let inserts = ['businesses', updateDetails, 'id', businessId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error updating the product.',
                sqlMessage: error.sqlMessage ? error.sqlMessage : 'A database error was encountered.'
            })
        } else {
            callback(results)
        }
    });    
}
