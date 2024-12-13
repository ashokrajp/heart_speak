const express = require('express');
const ServiceController = require('../controller/service_controller')
const router = express.Router();

router.post('/add-category', ServiceController.addcategory)
router.post('/list-category', ServiceController.listcategory)
router.post('/all-products', ServiceController.allproducts)
router.post('/near-shops', ServiceController.nearbyshop)
router.post('/product-wishlist', ServiceController.productwishlist)
router.post('/shop-wishlist', ServiceController.shopwishlist)

router.post('/add-products', ServiceController.addproducts)

module.exports = router