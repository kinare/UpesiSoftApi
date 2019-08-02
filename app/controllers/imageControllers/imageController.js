var imageModel = require('../../models/imageModels/imageModel')
var productModel = require('../../models/productModels/productModel')
const path = require('path')
const fs = require('fs')

exports.uploadProductImage = function(req, res) {
    // Get relevant details
    // Checking all parameters are available
    let businessId = req.userDetails.businessId
    let productImage = req.file
    let productId = req.body['productId']
    console.log(productImage)

    let errorArray = []
    if(!businessId) {errorArray.push({name: 'businessId', text: 'Missing user token.'})}
    if(!productImage) {errorArray.push({name: 'productImage', text: 'Missing product image.'})}
    if(!productId) {errorArray.push({name: 'productId', text: 'Missing product Id.'})}

    if(errorArray.length > 0 ) {
        // If variables are missing
        return res.status(400).send({
            status: 'error',
            message: 'Missing user token. Please check request.',
            data: {
                list: errorArray
            }
        })
    }

    let updateDetails = {
        productImageUrl: productImage ? 'https://cdn.upesisoft.com/images/' + productImage.filename : null
    }

    // Update product image
    // productModel.updateProduct(productId, updateDetails, function(uploadImageResponse) {

    // })

    // Continue upload process
    const targetPath = path.normalize('/var/www/html/cdn/upesisoft/images/' + productImage.filename + path.extname(productImage.originalname).toLowerCase())
    const tempPath = productImage.path
    console.log(targetPath)

    if (path.extname(productImage.originalname).toLowerCase()) {
        fs.rename(tempPath, targetPath, err => {
            // if (err) return handleError(err, res);

            res.send({
                status: 'success',
                data: {
                    image: productImage,
                    error: err
                }
            })
        });
    } else {
        fs.unlink(tempPath, err => {
            // if (err) return handleError(err, res);

            res.status(403).send({
                status: 'error',
                message: 'There was an error uploading your image.',
                error: err
            });
        });
    }

}