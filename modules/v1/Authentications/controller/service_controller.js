const serviceModel = require('../models/service_model');
const Codes = require('../../../../config/status_code');
const checkValidationRules = require('../validations');
const middleware = require('../../../../middleware/headerValidators')

//*==================================================ADD CATEGORY======================================================*//
const addcategory = async (req, res) => {
    const valid = await middleware.checkValidationRules(req.body, checkValidationRules.addCategory);

    const request = {
        ...req.body,
    }

    if (valid.status) {
        return serviceModel.addCategory(request, res)
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null)
    }
}


//*==================================================LIST CATEGORY======================================================*//
const listcategory = async (req, res) => {
    req.body.userId = req.user_id
    return serviceModel.listCategory(req.body, res)

}

//*==================================================GET ALL PRODUCTS======================================================*//
const allproducts = async (req, res) => {
    req.body.userId = req.user_id
    return serviceModel.getAllProducts(req.body, res)
}

//*==================================================NEAR BY SHOPS======================================================*//
const nearbyshop = async (req, res) => {
    req.body.userId = req.user_id;
    return serviceModel.getNearByShops(req.body, res)
}

//*==================================================PRODUCT WISHLIST======================================================*//
const productwishlist = async (req, res) => {
    req.body.userId = req.user_id
    return serviceModel.addRemoveWishlist(req.body, res)
}

//*==================================================SHOP WISHLIST======================================================*//
const shopwishlist = async (req, res) => {
    req.body.userId = req.user_id
    return serviceModel.addRemoveShopWishlist(req.body, res)
}

//*==================================================ADD BULK PRODUCTS======================================================*//
const addproducts = async (req, res) => {
    return serviceModel.addProducts(req.body, res)
}




module.exports = {
    addcategory,
    listcategory,
    allproducts,
    productwishlist,
    shopwishlist,
    nearbyshop,
    addproducts
}