let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})

exports.newRestockEntry = function(restockDetails = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['productRestocks', restockDetails];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: 'There was an error entering a new product restock request.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });
}

exports.updateRestockOrder = function(restockId = null, updateDetails = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ?";

    let inserts = ['productRestocks', updateDetails, 'id', restockId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error updating the restock order.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });    
}
