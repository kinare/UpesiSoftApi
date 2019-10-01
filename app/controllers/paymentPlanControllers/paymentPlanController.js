const paymentPlanModel = require('../../models/paymentPlanModels/paymentPlansModel')

/**
 * Get all payment plan details, periods & features
 */
exports.getAll = function(req, res) {
    // Get payment plans
    paymentPlanModel.getAllPlans((paymentPlansResponse) => {
        if(!paymentPlansResponse.error && paymentPlansResponse.length > 0) {
            // Looping over payment plans
            let arrayLength = paymentPlansResponse.length
            for(let i = 0; i < arrayLength; i++) {
                // 1. Get payment plan features
                const getPaymentPlanFeatures = new Promise((resolve, reject) => {
                    if(paymentPlansResponse[i].id) {
                        paymentPlanModel.getPlanFeatures(paymentPlansResponse[i].id, (paymentPlanFeatureResponse) => {
                            if(!paymentPlanFeatureResponse.error && paymentPlanFeatureResponse.length > 0) {
                                resolve(paymentPlanFeatureResponse)
                            } else {
                                resolve(null)
                            }
                        })
                    } else {
                        resolve(null)
                    }
                })

                // 2. Get payment plan periods 
                const getPaymentPlanPeriods = new Promise((resolve, reject) => {
                    if(paymentPlansResponse[i].id) {
                        paymentPlanModel.getPlanPeriods(paymentPlansResponse[i].id, (paymentPlanPeriodsResponse) => {
                            if(!paymentPlanPeriodsResponse.error && paymentPlanPeriodsResponse.length > 0) {
                                resolve(paymentPlanPeriodsResponse)
                            } else {
                                resolve(null)
                            }                                
                        })
                    } else {
                        resolve(null)
                    }
                })

                Promise.all([
                    getPaymentPlanFeatures,
                    getPaymentPlanPeriods
                ]).then((responseData) => {
                    // Inject extra response to array
                    console.log('Plan features: ' + responseData[0])
                    paymentPlansResponse[i]['paymentPlanFeatures'] = responseData[0] ? responseData[0] : null
                    console.log('Plan periods: ' + responseData[1])
                    paymentPlansResponse[i]['paymentPlanPeriods'] = responseData[1] ? responseData[1] : null

                    if(i === (arrayLength - 1)) {
                        res.send({
                            status: 'success',
                            data: paymentPlansResponse
                        })
                    }
                })
            }
        } else {
            res.status(400).send({
                status: 'error',
                message: paymentPlansResponse.text ? paymentPlansResponse.text : 'There was an error fetching information on payment plans.',
                sqlMessage: paymentPlansResponse.sqlMessage ? paymentPlansResponse.sqlMessage : null
            })
        }
    })
}
