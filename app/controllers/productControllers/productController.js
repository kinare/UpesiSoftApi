const productModel = require('../../models/productModels/productModel')
const userIdentityModel = require('../../models/userModels/userIdentityModel')
const moment = require('moment')
const path = require('path')
const fs = require('fs')

exports.getAll = function(req, res) {
    // Checking all parameters are available
    let businessId = req.userDetails.businessId

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Request not fulfilled. There was some missing information.',
            data: {
                list: errorArray
            }
        })
    }

    // Proceed to get product list
    productModel.getAll(businessId, function(response) {
        if(response.error) {
            res.status(400).send({
                status: 'error',
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        } else {
            // Return response list
            res.send({
                status: 'success',
                data: response
            })
        }
    })
}

// Create a new product
exports.new = function(req, res) {
    // Checking all parameters are available
    let businessId = req.userDetails.businessId
    let productName = req.body['productName'] ? req.body['productName'] :null
    let productDescription = req.body['productDescription'] ? req.body['productDescription'] : null
    let productShortDescription = req.body['productShortDescription'] ? req.body['productShortDescription'] : null
    let productCategoryId = parseInt(req.body['productCategoryId']) !== undefined ? parseInt(req.body['productCategoryId']) : null
    let availableFrom = req.body['availableFrom'] ? req.body['availableFrom'] : null
    let availableTo = req.body['availableTo'] ? req.body['availableTo'] : null
    let sku = req.body['sku'] ? req.body['sku'] : null
    let price = parseFloat(req.body['price']) !== undefined ? parseFloat(req.body['price']) : 0.00
    let salePrice = parseFloat(req.body['price']) ? parseFloat(req.body['price']) : 0.00
    let unitPrice = parseFloat(req.body['unitPrice']) ? parseFloat(req.body['unitPrice']) : 0.00
    let measurementUnitId = parseInt(req.body['measurementUnitId']) !== undefined ? parseInt(req.body['measurementUnitId']) : null
    let taxClassId = req.body['taxClassId'] ? req.body['taxClassId'] : null
    let published = parseInt(req.body['published']) !== undefined ? parseInt(req.body['published']) : null
    // New fields - Focus
    let storageLocation = req.body['storageLocation'] ? req.body['storageLocation'] : null // aisle No. etc
    let sellAs = req.body['sellAs'].trim() ? req.body['sellAs'].trim() : null // CUSTOM or FULL
    let customSaleUnit = req.body['customSaleUnit'] // Only available if sellAs === CUSTOM
    let measurement = parseFloat(req.body['measurement']) !== undefined ? parseFloat(req.body['measurement']) : null
    let qty = parseInt(req.body['qty']) ? parseInt(req.body['qty']) : 0 // Default - 0
    let productImage = req.file ? req.file : null
    let productId = parseInt(req.body['id']) ? parseInt(req.body['id']) : null
    let state = parseInt(req.body['state']) !== undefined ? parseInt(req.body['state']) : null
    let initiateUserId = req.userDetails.id ? req.userDetails.id : null

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productName) {errorArray.push({name: 'productName', text: 'Missing product name.'})}
    if(!productDescription) {errorArray.push({name: 'productDescription', text: 'Missing product description.'})}
    if(!productShortDescription) {errorArray.push({name: 'productShortDescription', text: 'Missing product short description.'})}
    if(!productCategoryId) {errorArray.push({name: 'productCategoryId', text: 'Missing product category Id.'})}
    if(!price && typeof price !== 'number') {errorArray.push({name: 'price', text: 'Missing product price.'})}
    if(!measurementUnitId) {errorArray.push({name: 'measurementUnitId', text: 'Missing measurement unit.'})}
    if(!published) {errorArray.push({name: 'published', text: 'Missing published field.'})}
    if(!sellAs) {errorArray.push({name: 'sellAs', text: 'Missing sellAs field.'})}
    // If sellAs === CUSTOM, check for customSaleUnit & measurement
    if(sellAs === 'CUSTOM') {
        if(!customSaleUnit) {errorArray.push({name: 'customSaleUnit', text: 'Missing Custom Sale Unit field.'})}
        if(!measurement) {errorArray.push({name: 'measurement', text: 'Missing measurement field.'})}
        // Check if number
        if(!qty && typeof qty == "number") {errorArray.push({name: 'qty', text: 'Missing quantity field or wrong datatype. Please enter a number.'})}
        if(!unitPrice && typeof unitPrice !== 'number') {errorArray.push({name: 'unitPrice', text: 'Missing product unit price.'})}
    }
    if(sellAs !== 'FULL' || sellAs !== 'CUSTOM') {
        errorArray.push({name: 'sellAs', text: 'Please enter a valid sellAs variable(Should be either CUSTOM or FULL).'})
    }

    console.log('SELL AS VALUE: ', sellAs)

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing parameters. Please check data list.',
            data: {
                list: errorArray
            }
        })
    }

    if(productImage) {
        // Insert product image
        const targetPath = path.normalize(process.env.IMAGES_UPLOAD_ROOT + 'images/products/' + productImage.filename + path.extname(productImage.originalname).toLowerCase())
        const tempPath = productImage.path
        var productImageUrl = productImage ? process.env.CDN_URL + 'images/products/' + productImage.filename + path.extname(productImage.originalname).toLowerCase() : null

        // Update product Image path name
        if (path.extname(productImage.originalname).toLowerCase()) {
            fs.rename(tempPath, targetPath, err => {
                console.log(err ? err : 'Successfully updated product image path. Image uploaded successfully.')
            });
        } else {
            fs.unlink(tempPath, err => {
                console.log(err ? err : 'There was an error unlinking product image path. Image not successfully updated.')
            });
        }
    }

    // Get user details
    userIdentityModel.getUser(initiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if insert or update
                    if(!productId) {
                        // Check if user can create
                        if(userPermissionsResponse[0].createProduct === 1) {
                            // Insert new product
                            let insertData = {
                                businessId: businessId,
                                productName: productName,
                                productDescription: productDescription,
                                productShortDescription: productShortDescription,
                                productCategoryId: productCategoryId ? productCategoryId : null,
                                productImage: productImageUrl ? productImageUrl : null,
                                availableFrom: availableFrom ? availableFrom : null,
                                availableTo: availableTo ? availableTo : null,
                                sku: sku ? sku : null,
                                sellAs: sellAs,
                                storageLocation: storageLocation,
                                customSaleUnit: customSaleUnit,
                                measurement: measurement,
                                qty: qty,
                                price: price,
                                salePrice: salePrice,
                                unitPrice: unitPrice,
                                measurementUnitId: measurementUnitId,
                                taxClassId: taxClassId ? taxClassId : null,
                                published: published,
                                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                            }

                            productModel.addNew(insertData, function(response) {
                                // Check if user details were inserted
                                if(!response.error && response.insertId) {
                                    // Insert sub-products based on the sellAs field, quantity & measurement type
                                    // if(sellAs === "CUSTOM") {
                                    //     // Upload subProductList
                                    //     // Getting data
                                    //     let subProductList = []

                                    //     // Loop into list
                                    //     for(let i = 0; i < qty; i++) {
                                    //         subProductList.push([response.insertId,measurement,measurementUnitId,1,moment().format('YYYY-MM-DD HH:mm:ss'),moment().format('YYYY-MM-DD HH:mm:ss')])
                                    //     }

                                    //     // Insert to database
                                    //     productModel.addSubProductList(subProductList, function(subProductsResponse) {
                                    //         if(subProductsResponse.insertId) {
                                    //             res.send({
                                    //                 status: 'success',
                                    //                 data: null
                                    //             })
                                    //         } else {
                                    //             // No sub-products inserted
                                    //             res.status(400).send({
                                    //                 status: 'error',
                                    //                 message: 'There was an error inserting the sub product list.',
                                    //                 sqlMessage: response.sqlMessage ? response.sqlMessage : null
                                    //             })
                                    //         }
                                    //     })
                                    // } else {
                                    //     // Inserted FULL Product
                                    //     res.send({
                                    //         status: 'success',
                                    //         data: null
                                    //     })
                                    // }

                                    // If product is successfully inserted
                                    res.send({
                                        status: 'success',
                                        data: null
                                    })

                                } else {
                                    // Return error
                                    res.status(400).send({
                                        status: 'error',
                                        message: response.text ? response.text : 'There was an error creating the new product. Please try again. If the issue persists, kindly contact support.',
                                        sqlMessage: response.sqlMessage ? response.sqlMessage : null
                                    })
                                }        
                            })
                        } else {
                            res.status(400).send({
                                status: 'error',
                                message: 'Could not perform action. User is not authorized.'
                            })
                        }
                    } else {
                        // Check if user can create
                        if(userPermissionsResponse[0].editProduct === 1) {
                            // Gather updated information
                            let updatedData = {}

                            if(productImage)
                                updatedData.productImage = productImage
                            if(productName)
                                updatedData.productName = productName
                            if(productDescription)
                                updatedData.productDescription = productDescription
                            if(productShortDescription)
                                updatedData.productShortDescription = productShortDescription
                            if(productColor)
                                updatedData.productColor = productColor
                            if(productCategoryId)
                                updatedData.productCategoryId = productCategoryId
                            if(availableFrom)
                                updatedData.availableFrom = availableFrom
                            if(availableTo)
                                updatedData.availableTo = availableTo
                            if(sku)
                                updatedData.sku = sku
                            if(price)
                                updatedData.price = price
                            if(salePrice)
                                updatedData.salePrice = salePrice
                            if(unitPrice)
                                updatedData.unitPrice = unitPrice
                            if(measurementUnitId)
                                updatedData.measurementUnitId = measurementUnitId
                            if(taxClassId)
                                updatedData.taxClassId = taxClassId
                            if(published)
                                updatedData.published = published
                            if(storageLocation)
                                updatedData.storageLocation = storageLocation
                            if(sellAs)
                                updatedData.sellAs = sellAs
                            if(customSaleUnit)
                                updatedData.customSaleUnit = customSaleUnit
                            if(measurement)
                                updatedData.measurement = measurement
                            if(qty)
                                updatedData.qty = qty
                            if(productId)
                                updatedData.id = productId
                            if(state !== null && state <= 1)
                                updatedData.state = state

                            updatedData.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')

                            // Update product
                            productModel.updateProduct(productId, updatedData, function(updateProductResponse) {
                                if(updateProductResponse.affectedRows > 0) {
                                    // Return success
                                    res.send({
                                        status: 'success',
                                        data: null
                                    })
                                } else {
                                    // Error updating product
                                    res.status(400).send({
                                        status: 'error',
                                        message: 'There was an error updating the product. Please try again. If the issue persists, contact an administrator.',
                                        sqlMessage: updateProductResponse.sqlMessage ? updateProductResponse.sqlMessage : null
                                    })
                                }
                            })
                        } else {
                            res.status(400).send({
                                status: 'error',
                                message: 'Could not perform action. User is not authorized.'
                            })
                        }
                    }
                } else {
                    res.status(400).send({
                        status: 'error',
                        message: 'Could not perform action. There was an error retrieving user permissions.'
                    })
                }
            })

        } else {
            res.status(400).send({
                status: 'error',
                message: 'Please login with a valid user. User trying to perform action not found.'
            })
        }
    })
}

// Delete a product
exports.deleteProduct = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId ? req.userDetails.businessId : null
    let productId = parseInt(req.body['productId']) ? parseInt(req.body['productId']) : null
    let deleteInitiateUserId = req.userDetails.id ? req.userDetails.id : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productId) {errorArray.push({name: 'productId', text: 'Missing product Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing required parameters in the request.',
            data: {
                list: errorArray
            }
        })
    }

    // Check if user has delete permissions
    // Get delete user details
    userIdentityModel.getUser(deleteInitiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can delete
                    if(userPermissionsResponse[0].deleteProducts === 1) {
                        // Delete product
                        let updateData = {
                            state: 0,
                            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        
                        let updateVariables = {
                            id: productId,
                            businessId: businessId
                        }

                        productModel.deleteProduct(updateVariables, updateData, function(deleteProductResponse) {
                            if(deleteProductResponse.affectedRows) {
                                res.send({
                                    status: 'success',
                                    data: null
                                })
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error deleting the product. Please make sure that the product exists and try again.'
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            status: 'error',
                            message: 'Could not perform action. User is not authorized.'
                        })
                    }

                } else {
                    res.status(400).send({
                        status: 'error',
                        message: 'Could not perform action. There was an error retrieving user permissions.'
                    })
                }
            })

        } else {
            res.status(400).send({
                status: 'error',
                message: 'Please login with a valid user. User trying to perform action not found.'
            })
        }
    })
}

exports.getMeasurementUnits = function(req, res) {
    // Checking all parameters are available
    let businessId = req.userDetails.businessId

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Request not fulfilled. There was some missing information.',
            data: {
                list: errorArray
            }
        })
    }

    // Get measurement Units list
    productModel.getMeasurementUnits(function(response) {
        if(response.error) {
            res.status(400).send({
                status: 'error',
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        } else {
            // Return response list
            res.send({
                status: 'success',
                data: response
            })
        }        
    })
}

// Create new product categories - if there is no business Id, those are the global categories
exports.createCategory = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId
    let initiateUserId = req.userDetails.id ? req.userDetails.id : null
    let productCategoryName = req.body['productCategoryName'] ? req.body['productCategoryName'] : null
    let productCategoryDesc = req.body['productCategoryDesc'] ? req.body['productCategoryDesc'] : null
    let parentId = parseInt(req.body['parentId']) ? parseInt(req.body['parentId']) : null
    let categoryId = parseInt(req.body['id']) ? parseInt(req.body['id']) : null
    let state = parseInt(req.body['state']) !== undefined ? parseInt(req.body['state']) : null

    // Check if all required parameters were passed
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productCategoryName) {errorArray.push({name: 'name', text: 'Missing name parameter.'})}
    if(!productCategoryDesc) {errorArray.push({name: 'description', text: 'Missing description parameter.'})}

    if(errorArray.length > 0) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Request not fulfilled. There was some missing information.',
            data: {
                list: errorArray
            }
        })
    }

    // Get user details
    userIdentityModel.getUser(initiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if insert or update
                    if(!categoryId) {
                        // Check if user can create product category
                        if(userPermissionsResponse[0].createProducts === 1) {
                            // Insert data to the table
                            let categoryData = {
                                productCategoryName: productCategoryName,
                                productCategoryDesc: productCategoryDesc,
                                parentId: parentId ? parentId : null,
                                businessId: businessId,
                                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                            }

                            productModel.insertProductCategory(categoryData, function(response) {
                                // Check if user details were inserted
                                if(!response.error) {
                                    if(response.insertId) {
                                        res.send({
                                            status: 'success',
                                            data: null
                                        })
                                    } else {
                                        // No product category inserted
                                        res.send({
                                            status: 'error',
                                            message: 'There was an error creating the product category. Please try again. Contact support if the issue persists.'
                                        })
                                    }
                                } else {
                                    // Return error
                                    res.send({
                                        status: 'error',
                                        message: response.text,
                                        sqlMessage: response.sqlMessage ? response.sqlMessage : null
                                    })
                                }
                            })
                        } else {
                            res.status(400).send({
                                status: 'error',
                                message: 'Could not perform action. User is not authorized.'
                            })
                        }
                    } else {
                        // Check if user can update product category
                        if(userPermissionsResponse[0].editProducts === 1) {
                            // Get category based on ID
                            productModel.getProductCategory(categoryId, businessId, function(response) {
                                if(!response.error && response.length > 0) {
                                    // Do update
                                    let categoryData = {}

                                    // Check for updated information
                                    if(productCategoryName)
                                        categoryData.productCategoryName = productCategoryName

                                    if(productCategoryDesc)
                                        categoryData.productCategoryDesc = productCategoryDesc

                                    if(parentId)
                                        categoryData.parentId = parentId

                                    if(state !== null && state <= 1)
                                        categoryData.state = state
                                    
                                    // Update date
                                    categoryData.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')

                                    // Run update
                                    productModel.updateProductCategory(categoryId, categoryData, function(categoryUpdateResponse) {
                                        if(categoryUpdateResponse.affectedRows > 0) {
                                            res.send({
                                                status: 'success',
                                                data: null
                                            })
                                        } else {
                                            res.status(400).send({
                                                status: 'error',
                                                message: 'There was an error updating the product category. Please try again or contact the support team if the issue persists.',
                                                sqlMessage: categoryUpdateResponse.sqlMessage ? categoryUpdateResponse.sqlMessage : null
                                            })
                                        }
                                    })

                                } else {
                                    res.status(400).send({
                                        status: 'error',
                                        message: 'There was an error retrieving the product category for update. Please make sure the category exists.',
                                        sqlMessage: response.sqlMessage ? response.sqlMessage : null
                                    })
                                }
                            })
                        } else {
                            res.status(400).send({
                                status: 'error',
                                message: 'Could not perform action. User is not authorized.'
                            })
                        }
                    }
                } else {
                    res.status(400).send({
                        status: 'error',
                        message: 'Could not perform action. There was an error retrieving user permissions.'
                    })
                }
            })

        } else {
            res.status(400).send({
                status: 'error',
                message: 'Please login with a valid user. User trying to perform action not found.'
            })
        }
    })
}

// Delete product category
exports.deleteCategory = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId ? req.userDetails.businessId : null
    let productCategoryId = parseInt(req.body['productCategoryId']) ? parseInt(req.body['productCategoryId']) : null
    let deleteInitiateUserId = req.userDetails.id ? req.userDetails.id : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productCategoryId) {errorArray.push({name: 'productCategoryId', text: 'Missing product category Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing required parameters in the request.',
            data: {
                list: errorArray
            }
        })
    }

    // Check if user has delete permissions
    // Get delete user details
    userIdentityModel.getUser(deleteInitiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can delete
                    if(userPermissionsResponse[0].deleteProducts === 1) {
                        // Delete product category
                        let updateData = {
                            state: 0,
                            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        
                        let updateVariables = {
                            id: productCategoryId,
                            businessId: businessId
                        }

                        productModel.deleteProductCategory(updateVariables, updateData, function(deleteProductCategoryResponse) {
                            if(deleteProductCategoryResponse.affectedRows) {
                                res.send({
                                    status: 'success',
                                    data: null
                                })
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error deleting the product. Please make sure that the product exists and try again.'
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            status: 'error',
                            message: 'Could not perform action. User is not authorized.'
                        })
                    }

                } else {
                    res.status(400).send({
                        status: 'error',
                        message: 'Could not perform action. There was an error retrieving user permissions.'
                    })
                }
            })

        } else {
            res.status(400).send({
                status: 'error',
                message: 'Please login with a valid user. User trying to perform action not found.'
            })
        }
    })
}

exports.getAllCategories = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Request not fulfilled. There was some missing information.',
            data: {
                list: errorArray
            }
        })
    }

    // Proceed to get product list
    productModel.getAllCategories(businessId, function(response) {
        if(response.error) {
            res.status(400).send({
                status: 'error',
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        } else {
            // Return product categories list
            res.send({
                status: 'success',
                data: response
            })
        }
    })
}

// Get all subProducts to a product
exports.getSubProducts = function(req, res) {
    // Get required params
    let businessId = req.userDetails.businessId
    let productId = req.query.productId

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productId) {errorArray.push({name: 'productId', text: 'Missing parent product Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Request not fulfilled. There was some missing information.',
            data: {
                list: errorArray
            }
        })
    }

    // Getting subProduct list based on Id
    productModel.getSubProducts(productId, function(response) {
        if(response.error) {
            res.status(400).send({
                status: 'error',
                message: response.text,
                sqlMessage: response.sqlMessage ? response.sqlMessage : null
            })
        } else {
            // Return response list
            res.send({
                status: 'success',
                data: response
            })
        }
    })
}

// Delete sub-product
exports.deleteSubProduct = function(req, res) {
    // Get params
    let businessId = req.userDetails.businessId ? req.userDetails.businessId : null
    let subProductId = parseInt(req.body['subProductId']) ? parseInt(req.body['subProductId']) : null
    let productId = parseInt(req.body['productId']) ? parseInt(req.body['productId']) : null
    let deleteInitiateUserId = req.userDetails.id ? req.userDetails.id : null

    // Check if required parameters have been passed
    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!subProductId) {errorArray.push({name: 'subProductId', text: 'Missing sub-product Id.'})}
    if(!productId) {errorArray.push({name: 'productId', text: 'Missing primary product Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing required parameters in the request.',
            data: {
                list: errorArray
            }
        })
    }

    // Check if user has delete permissions
    // Get delete user details
    userIdentityModel.getUser(deleteInitiateUserId, null, function(userResponse) {
        if(userResponse) {
            // Get user permissions
            userIdentityModel.getUserPermissions(userResponse[0].userPermissionsId, function(userPermissionsResponse) {
                if(userPermissionsResponse) {
                    // Check if user can delete
                    if(userPermissionsResponse[0].deleteProducts === 1) {
                        // Get parent product
                        productModel.getProduct(businessId, productId, function(getProductResponse) {
                            if(!getProductResponse.error) {
                                // Delete sub-product
                                let updateData = {
                                    state: 0,
                                    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                                }
                                
                                let updateVariables = {
                                    id: subProductId,
                                    businessId: businessId
                                }
        
                                productModel.deleteSubProduct(updateVariables, updateData, function(deleteSubProductResponse) {
                                    if(deleteSubProductResponse.affectedRows) {
                                        res.send({
                                            status: 'success',
                                            data: null
                                        })
                                    } else {
                                        res.status(400).send({
                                            status: 'error',
                                            message: 'There was an error deleting the sub-product. Please make sure that the sub-product exists and try again.'
                                        })
                                    }
                                })                                
                            } else {
                                res.status(400).send({
                                    status: 'error',
                                    message: 'There was an error retrieving the primary product. Sub-product not deleted.'
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            status: 'error',
                            message: 'Could not perform action. User is not authorized.'
                        })
                    }

                } else {
                    res.status(400).send({
                        status: 'error',
                        message: 'Could not perform action. There was an error retrieving user permissions.'
                    })
                }
            })

        } else {
            res.status(400).send({
                status: 'error',
                message: 'Please login with a valid user. User trying to perform action not found.'
            })
        }
    })
}
