const productModel = require('../../models/productModels/productModel')

exports.getProductSales = function(req, res) {
    // Checking all parameters are available
    let businessId = req.userDetails.businessId
    let productId = req.query.productId ? parseInt(req.query.productId) : null

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productId) {errorArray.push({name: 'productId', text: 'Missing product Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Request not fulfilled. There was some missing information from the request.',
            data: {
                list: errorArray
            }
        })
    }

    // Proceed to get product list
    const getProductSales = new Promise((resolve, reject) => {
        productModel.getAllSales(productId, businessId, function(productSalesResponse) {
            if(!productSalesResponse.error) {
                resolve(productSalesResponse)
            } else {
                resolve(productSalesResponse)
            }
        })
    })

    // Get sales total
    const getSalesTotal = new Promise((resolve, reject) => {
        productModel.getSalesTotal(productId, businessId, function(salesTotalResponse) {
            if(!salesTotalResponse.error) {
                resolve(salesTotalResponse)
            } else {
                resolve(salesTotalResponse)
            }
        })
    })

    Promise.all([
        getProductSales,
        getSalesTotal
    ]).then((responseData) => {
        // Check for errors in the responses
        if(!responseData[0].error && !responseData[1].error) {
            // Return response list
            res.send({
                status: 'success',
                data: {
                    salesTotal: responseData[1][0] ? responseData[1][0].salesTotal : null,
                    salesList: responseData[0]
                }
            })
        } else {
            res.status(400).send({
                status: 'error',
                message: responseData[0].error ? responseData[0].text : responseData[1].error ? responseData[1].text : 'There was an error retrieving product sales data.',
                sqlMessage: responseData[0].error ? responseData[0].sqlMessage : responseData[1].error ? responseData[1].sqlMessage : null
            })
        }
    })
}
