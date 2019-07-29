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
    let sql = "SELECT products.*, measurementUnits.measurementName, measurementUnits.measurementAbbreviation, productCategories.productCategoryName, productCategories.parentId as productCategoryParentId FROM ?? LEFT JOIN ?? ON ?? = ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['products', 'measurementUnits', 'products.measurementUnitId', 'measurementUnits.id', 'productCategories', 'products.productCategoryId', 'productCategories.id', 'products.businessId', businessId, 'products.state', 1];
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

    let inserts = ['subProductList', ['primaryProductId','measurement','measurementUnitId','state','createdAt','updatedAt'], subProductList];
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

exports.getSubProducts = function(productId = null, callback) {
    let sql = "SELECT subProductList.*, measurementUnits.measurementAbbreviation, measurementUnits.measurementName, products.productName, products.sku, products.price, products.salePrice, products.unitPrice FROM ?? LEFT JOIN ?? ON ?? = ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['subProductList', 'measurementUnits', 'subProductList.measurementUnitId', 'measurementUnits.id', 'products', 'subProductList.primaryProductId', 'products.id', 'primaryProductId', productId, 'subProductList.state', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the sub product list.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No products exists
                callback({
                    error: true,
                    text: 'There were no sub products found.'
                })
            }
        }
    });
}

exports.getProduct = function(productId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['products', 'state', 1, 'id', productId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the product.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No product exists
                callback({
                    error: true,
                    text: 'There was no product with that ID found.'
                })
            }
        }
    });
}

exports.getSubProduct = function(subProductId = null, callback) {
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['subProductList', 'state', 1, 'id', subProductId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the sub-product.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No product exists
                callback({
                    error: true,
                    text: 'There was no sub-product with that ID found.'
                })
            }
        }
    });
}

exports.updateProduct = function(productId = null, updateDetails = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ?";

    let inserts = ['products', updateDetails, 'id', productId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error updating the product.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });    
}

exports.updateSubProduct = function(subProductId = null, updateDetails = null, callback) {
    // If codes match, update entry
    let sql = "UPDATE ?? SET ? WHERE ?? = ?";

    let inserts = ['subProductList', updateDetails, 'id', subProductId];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error updating the sub-product.',
                sqlMessage: error.sqlMessage
            })
        } else {
            callback(results)
        }
    });    
}
