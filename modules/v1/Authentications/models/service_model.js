require('dotenv').config();
const { default: mongoose } = require('mongoose');
const Codes = require('../../../../config/status_code');
const middleware = require('../../../../middleware/headerValidators');
const userModel = require('../../../schema/tbl_users');
const moment = require('moment');
const common = require('../../../../config/common');


const serviceModel = {
    /*=============================================================================================================================
                                                           ADD CATEGORY   
   =============================================================================================================================*/
    async addCategory(req, res) {
        try {
            const { categories } = req;
            if (!Array.isArray(categories) || categories.length === 0) {
                return middleware.sendResponse(res, Codes.INVALID, 'Invalid Categories');
            }
            const prepareCategories = categories.map(value => ({
                name: value.name,
                category_image: value.category_image || 'img.jpg',
            }))
            const result = await categoriesModel.insertMany(prepareCategories);
            if (result) {
                return middleware.sendResponse(res, Codes.SUCCESS, 'Category Added Successfully', result);
            } else {
                return middleware.sendResponse(res, Codes.INVALID, 'Categories not added', error);
            }


        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);
        }
    },


    /*=============================================================================================================================
                                                          LIST CATEGORY   
    =============================================================================================================================*/
    async listCategory(req, res) {
        try {
            const response = await categoriesModel.aggregate([
                {
                    $match: {
                        is_active: '1',
                        is_delete: '0'
                    }
                }, {
                    $project: {
                        _id: 1,
                        name: 1,
                        category_image: 1
                    }
                }
            ]);
            if (response) {
                if (response.length > 0) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Category List', response);
                } else {
                    return middleware.sendResponse(res, Codes.INVALID, 'No Categories Found', []);
                }
            } else {
                return middleware.sendResponse(res, Codes.INVALID, 'No Categories Found', null);
            }

        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }

    },

    /*=============================================================================================================================
                                                          GET ALL PRODUCTS  
    =============================================================================================================================*/
    async getAllProducts(req, res) {
        try {
            let searchTerm = {};
            if (req.searchProduct) {
                const searchRegex = new RegExp(req.searchProduct, 'i');
                searchTerm.product_name = searchRegex;
            }

            let priceSorting = {};
            if (req.filterPrice === 'lowest') {
                priceSorting.selling_price = 1;  // ascending
            } else {
                priceSorting.selling_price = -1; // descending
            }

            const response = await productsModel.aggregate([
                {
                    $match: {
                        is_active: '1',
                        is_delete: '0',
                        ...searchTerm
                    }
                },
                {
                    $lookup: {
                        from: 'tbl_productImages',
                        localField: '_id',
                        foreignField: 'product_id',
                        as: 'productImages'
                    }
                },
                {
                    $lookup: {
                        from: 'tbl_productwishlists',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'productWishlist'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        product_name: 1,
                        product_description: 1,
                        selling_price: 1,
                        actual_price: 1,
                        created_at: 1,
                        updated_at: 1,
                        is_wishlist: {
                            // $size: '$is_wishlist'
                            // $map: {
                            //     input: '$productWishlist',
                            //     as: 'wishlist',
                            //     in: {
                            //         _id: '$$wishlist._id',
                            //         userId: '$$wishlist.userId',
                            //         productId: '$$wishlist.productId'
                            //     }
                            // }
                            $cond: { if: { $gt: [{ $size: '$productWishlist' }, 0] }, then: 1, else: 0 }
                        },
                        productImages: {
                            $map: {
                                input: '$productImages',
                                as: 'img',
                                in: {
                                    _id: '$$img._id',
                                    image: '$$img.image'
                                }
                            }
                        }
                    }
                },
                {
                    $sort: {
                        ...priceSorting,
                        _id: -1
                    }
                }
            ]);
            if (response) {
                if (response.length > 0) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Products Found', response);
                } else {
                    return middleware.sendResponse(res, Codes.INVALID, 'No Products Found', []);
                }
            } else {
                return middleware.sendResponse(res, Codes.INVALID, 'Invalid query', null);
            }

        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);
        }
    },

    /*=============================================================================================================================
                                                         NEAR BY SHOPS 
    =============================================================================================================================*/
    getNearByShops: async (req, res) => {
        try {
            const findUser = await userModel.findOne({
                _id: req.userId
            })
            console.log(`::::::::USER::::::::`, findUser)



            const findShop = await shopModel.aggregate([
                {
                    $match: {
                        is_active: '1',
                        is_delete: '0'
                    }
                },
                {
                    $lookup: {
                        from: 'tbl_shop_images',
                        localField: '_id',
                        foreignField: 'shopId',
                        as: 'images'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        shopImages: {
                            $map: {
                                input: '$shopImages',
                                as: 'img',
                                in: {
                                    _id: '$$img._id',
                                    image: '$$img.image'
                                }
                            }
                        }
                    }
                }
            ])

            console.log(`::::::::SHOP::::::::`, findShop);

        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }
    },


    /*=============================================================================================================================
                                                         ADD REMOVE SHOP WISHLIST  
   =============================================================================================================================*/
    addRemoveShopWishlist: async (req, res) => {
        try {
            const { shopId, userId } = req;
            const findWishlist = await shopWishlistModel.findOne({
                userId: userId,
                shopId: shopId
            })
            if (findWishlist) {
                const removeWishlist = await shopWishlistModel.deleteOne({
                    userId: userId,
                    shopId: shopId
                })
                if (removeWishlist) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Shop removed from wishlist', null);
                } else {
                    return middleware.sendResponse(res, Codes.INVALID, 'Failed to remove wishlist', null);
                }
            } else {
                const addWishlist = await shopWishlistModel.create({
                    userId: userId,
                    shopId: shopId
                })
                if (addWishlist) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Shop added to wishlist', null);
                } else {
                    return middleware.sendResponse(res, Codes.INVALID, 'Failed to add wishlist', null);
                }
            }

        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }
    },


    /*=============================================================================================================================
                                                          ADD REMOVE PRODUCTS WISHLIST  
    =============================================================================================================================*/
    async addRemoveWishlist(req, res) {
        try {
            const { productId, userId } = req;
            const findWishlist = await productWishlistModel.findOne({
                userId: userId,
                productId: productId
            })
            if (findWishlist) {
                const removeWishlist = await productWishlistModel.deleteOne({
                    userId: userId,
                    productId: productId
                })
                if (removeWishlist) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Product removed from wishlist', null);
                } else {
                    return middleware.sendResponse(res, Codes.INVALID, 'Failed to remove product from wishlist', null);
                }
            } else {
                const addWishlist = await productWishlistModel.create({
                    userId: userId,
                    productId: productId
                })
                if (addWishlist) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Product added to wishlist', null);
                } else {
                    return middleware.sendResponse(res, Codes.INVALID, 'Failed to add product to wishlist', null);
                }
            }

        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }
    },



    /*=============================================================================================================================
                                                          ADD PRODUCTS  
    =============================================================================================================================*/
    async addProducts(req, res) {
        try {
            const addProductItem = await productsItemModel.insertMany(req);
            if (addProductItem.length > 0) {
                return middleware.sendResponse(res, Codes.SUCCESS, 'Product added successfully', addProductItem);
            } else {
                return middleware.sendResponse(res, Codes.INVALID, 'Failed to add product', null);
            }

        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }
    }




}

module.exports = serviceModel





// const userId = req.user_id; // Assume this comes from your request
// const userLatitude = /* Get the user's latitude */; 
// const userLongitude = /* Get the user's longitude */;

// db.tbl_shop.aggregate([
//     {
//         $match: {
//             is_active: 1,
//             is_delete: 0
//         }
//     },
//     {
//         $lookup: {
//             from: "tbl_shop_images",
//             localField: "id",
//             foreignField: "shop_id",
//             as: "images"
//         }
//     },
//     {
//         $lookup: {
//             from: "tbl_shop_category",
//             localField: "category_id",
//             foreignField: "id",
//             as: "category"
//         }
//     },
//     {
//         $addFields: {
//             distance: {
//                 $round: [
//                     {
//                         $multiply: [
//                             6371,
//                             {
//                                 $acos: {
//                                     $add: [
//                                         {
//                                             $multiply: [
//                                                 { $cos: { $toRadians: userLatitude } },
//                                                 { $cos: { $toRadians: "$latitude" } },
//                                                 {
//                                                     $multiply: [
//                                                         { $cos: { $toRadians: { $subtract: [userLongitude, "$longitude"] } } },
//                                                         { $sin: { $toRadians: "$latitude" } }
//                                                     ]
//                                                 }
//                                             ]
//                                         },
//                                         { $multiply: [ { $sin: { $toRadians: userLatitude } }, { $sin: { $toRadians: "$latitude" } } ] }
//                                     ]
//                                 }
//                             }
//                         ]0


//                     },
//                     2
//                 ]0
//             }
//         }
//     },
//     {
//         $lookup: {
//             from: "tbl_shop_wishlist",
//             let: { shopId: "$id" },
//             pipeline: [
//                 {
//                     $match: {
//                         $expr: {
//                             $and: [
//                                 { $eq: ["$shop_id", "$$shopId"] },
//                                 { $eq: ["$user_id", userId] }
//                             ]
//                         }
//                     }
//                 },
//                 {
//                     $project: { is_like: { $cond: [{ $ne: ["$shop_id", ""] }, 1, 0] } }
//                 }
//             ],
//             as: "wishlist"
//         }
//     },
//     {
//         $addFields: {
//             is_like: { $ifNull: [{ $arrayElemAt: ["$wishlist.is_like", 0] }, 0] }
//         }
//     },
//     {
//         $match: {
//             distance: { $lt: 3 }
//         }
//     },
//     {
//         $project: {
//             id: 1,
//             shopname: "$name",
//             image: { $arrayElemAt: ["$images.image", 0] }, // Assuming you want the first image
//             category_name: { $arrayElemAt: ["$category.name", 0] },
//             distance: 1,
//             is_like: 1
//         }
//     }
// ]);
