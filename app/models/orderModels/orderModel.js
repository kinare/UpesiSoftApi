let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'Karibu098!@#',
    database        : 'focusErp'
});

exports.newOrder = function(orderDetails = null, callback) {
    let sql = "INSERT INTO ?? SET ?";

    let inserts = ['orders', orderDetails];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if(error) {
            callback({
                error: true,
                text: 'There was an error inserting the order.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });
}

exports.insertOrderItems = function(orderItemsData = null, callback) {
    let sql = "INSERT INTO ?? (??) VALUES ?";

    let inserts = ['orderItems', ['primaryProductId','measurement','measurementUnitId','state','createdAt','updatedAt'], subProductList];
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
