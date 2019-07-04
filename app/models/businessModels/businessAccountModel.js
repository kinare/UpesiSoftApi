let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
});

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
