let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USERNAME,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_DATABASE
})

exports.getOrganizationPaymentPlan = function(organizationId = null, callback) {
    // Get organization payment plan
    let sql = "SELECT * FROM ?? LEFT JOIN ?? ON ?? = ?? LEFT JOIN ?? ON ?? = ?? ORDER BY ?? DESC";
    
    let inserts = ['paymentPlanTransactions', 'paymentPlanPeriods', 'paymentPlanTransactions.paymentPlanPeriodId', 'paymentPlanPeriods.id', 'paymentPlans', 'paymentPlanPeriods.paymentPlanId', 'paymentPlans.id', 'paymentPlanTransactions.id'];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the organization\'s payment plan.',
                sqlMessage: error.sqlMessage 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                callback({
                    error: true,
                    text: 'There were no payment plan transactions found.'
                })
            }
        }
    })
}

exports.getAllPlans = function(callback) {
    // Get latest organization payment plan
    let sql = "SELECT * FROM ?? WHERE ?? = ?";
    
    let inserts = ['paymentPlans', 'paymentPlanState', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the payment plans.',
                sqlMessage: error.sqlMessage ? error.sqlMessage : null 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No payment plans exists
                callback({
                    error: true,
                    text: 'There were no payment plans found.'
                })
            }
        }
    })
}

exports.getPlanFeatures = function(paymentPlanId = null, callback) {
    // Get latest organization payment plan
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['paymentPlanFeatures', 'paymentPlanId', paymentPlanId, 'paymentPlanFeatureState', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the payment plan features.',
                sqlMessage: error.sqlMessage ? error.sqlMessage : null 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                // No payment plans exists
                callback({
                    error: true,
                    text: 'There were no payment plans features found.'
                })
            }
        }
    })
}

exports.getPlanPeriods = function(paymentPlanId = null, callback) {
    // Get latest organization payment plan
    let sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    
    let inserts = ['paymentPlanPeriods', 'paymentPlanId', paymentPlanId, 'paymentPlanPeriodState', 1];
    sql = mysql.format(sql, inserts);

    pool.query(sql, function (error, results, fields) {
        if (error) {
            callback({
                error: true,
                text: 'There was an error retrieving the payment plan periods.',
                sqlMessage: error.sqlMessage ? error.sqlMessage : null 
            })
        } else {
            if(results && results.length > 0) {
                callback(results)
            } else {
                callback({
                    error: true,
                    text: 'There were no payment plans periods found.'
                })
            }
        }
    })
}
