let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})

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

    let inserts = ['orderItems', ['orderId','productId','subProductId','sellAs','qty','soldMeasurement','measurementBefore','measurementAfter','price','state','createdAt','updatedAt'], orderItemsData];
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

exports.getOrders = function(businessId = null, orderType = null, orderId = null, orderStatus = null, fromDateTime = null, toDateTime = null, callback) {
    let sql = "SELECT orders.*, customers.customerFirstName, customers.customerLastName, customers.customerBusinessName, customers.customerEmail, customers.customerCountryCode, customers.customerPhoneNumber, customers.customerPostalAddress, customers.customerAddress, customers.isBusiness as customerIsBusiness, users.firstName as cashierFirstName, users.lastName as cashierLastName, users.email as cashierEmail, users.phoneCountryCode as cashierCountryCode, users.userPhoneNumber as cashierPhoneNumber FROM ?? LEFT JOIN ?? ON ?? = ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ?";// AND ?? = ? AND ?? = ?";
    
    let inserts = ['orders', 'customers', 'orders.customerId', 'customers.id', 'users', 'orders.userId', 'users.id', 'orders.businessId', businessId]//, 'orderType', orderType, 'id', orderId];

    if(orderType) {
        sql += " AND orders.orderType = ?"
        inserts.push(orderType)
    }

    if(orderId) {
        sql += " AND orders.id = ?"
        inserts.push(orderId)
    }

    if(orderStatus) {
        sql += " AND orders.orderStatus = ?"
        inserts.push(orderStatus)
    }

    // If there is a date range passed
    if(fromDateTime) {
        sql += " AND orders.createdAt >= ?"
        inserts.push(fromDateTime)
        
        if(toDateTime) {
            sql += " AND orders.createdAt <= ?"
            inserts.push(toDateTime)
        }
    }

    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the order.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No product exists
                callback({
                    error: true,
                    text: 'There were no orders found.'
                })
            }
        }
    });
}

exports.getOrderItems = function(orderId = null, callback) {
    let sql = "SELECT orderItems.*, products.productName, products.measurementUnitId FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['orderItems', 'products', 'orderItems.productId', 'products.id', 'orderId', orderId, 'orderItems.state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the order item(s).',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No order item(s) exists
                callback({
                    error: true,
                    text: 'There were no order item(s) found.'
                })
            }
        }
    });
}
