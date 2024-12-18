// const crypto = require("crypto-js");
const Validator = require('Validator');
// const lang = require("../config/language");
const Codes = require('../config/status_code');
const userModel = require("../modules/schema/tbl_users");

// const SECRET = crypto.enc.Hex.parse(process.env.API_SECRET);
// const API_IV = crypto.enc.Hex.parse(process.env.API_IV);
const cryptoLib = require('cryptlib')
const shakey = cryptoLib.getHashSha256(process.env.KEY, 32);

const headerValidator = {


    //**************************************************************HEADER LANGUAGE***********************************************************************//
    extractHeaderLanguage: (req, res, next) => {
        try {
            const language = (req.headers['accept-language'] !== undefined && req.headers['accept-language'] !== '') ? req.headers['accept-language'] : "en";
            req.language = language;
            next()
        } catch (error) {

        }
    },



    //**************************************************************HEADER API KEY***********************************************************************//
    validateHeaderApiKey: async (req, res, next) => {
        const bypassHeaderKey = new Array("singup", "login", "otp-verification", "resend-opt", "forgot-otp", "forgot-password");
        try {
            // const apiKey = (req.headers['api-key'] != undefined && req.headers['api-key'] != '') ? crypto.AES.decrypt(req.headers['api-key'], SECRET, { iv: API_IV }).toString(crypto.enc.Utf8) : "";
            const apiKey = (req.headers['api-key'] != undefined && req.headers['api-key'] != '') ? req.headers['api-key'] : "";

            const pathData = req.path.split("/");
            if (bypassHeaderKey.indexOf(pathData[1]) === -1) {
                const dec_key = cryptoLib.decrypt(apiKey, shakey, process.env.IV)
                if (dec_key !== '') {
                    if (dec_key == process.env.API_KEY) {
                        next();
                    } else {
                        return await headerValidator.sendResponse(res, Codes.UNAUTHORIZED, 'API_KEY is not valid1', null);
                    }
                } else {
                    return await headerValidator.sendResponse(res, Codes.UNAUTHORIZED, 'API_KEY is not valid2', null);
                }
            } else {
                next()
            }
        } catch (error) {

        }
    },


    //**************************************************************HEADER TOKEN***********************************************************************//
    validateHeaderToken: async (req, res, next) => {
        const bypassMethod = [
            "otp-verification",
            "resend-opt",
            "forgot-otp",
            "forgot-password",
            "singup",
            "login",
        ];
        const pathData = req.path.split("/");


        try {
            console.log("-------------------------oatha pata",pathData);
            
            if (bypassMethod.indexOf(pathData[3]) === -1) {
                let headtoken = req.headers['token'] || '';

                headtoken = headtoken[0] === '"' ? headtoken.slice(1, -1) : headtoken;

                if (headtoken) {
                    try {
                        const dec_token = headtoken;

                        if (dec_token) {
                            const userDetails = await userModel.findOne({ token: dec_token });

                            if (userDetails) {
                                req.user_id = userDetails._id;
                                return next();
                            } else {
                                return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, 'INVALID TOKEN', null);
                            }
                        } else {
                            return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, 'INVALID TOKEN', null);
                        }
                    } catch (error) {
                        return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, 'TOKEN IS NOT VALID', null);
                    }
                } else {
                    return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, 'TOKEN NOT FOUND', null);
                }
            } else {
                return next();
            }
        } catch (error) {
            return headerValidator.sendResponse(res, Codes.INTERNAL_ERROR, 'An error occurred', null);
        }
    },


    //**************************************************************BALIDATION RULE***********************************************************************//
    checkValidationRules: async (request, rules) => {
        try {
            const v = Validator.make(request, rules);
            const validator = {
                status: true,
            }
            if (v.fails()) {
                const ValidatorErrors = v.getErrors();
                validator.status = false
                for (const key in ValidatorErrors) {
                    validator.error = ValidatorErrors[key][0];
                    break;
                }
            }
            return validator;
        } catch (error) {

        }
    },



    //**************************************************************DECRYPTION*******************************************************************//
    decryption: async (req, res, next) => {
        return new Promise((resolve, reject) => {
            try {
                if (req.body !== undefined && Object.keys(req.body).length !== 0) {
                    const request = JSON.parse(cryptoLib.decrypt(req.body, shakey, process.env.IV))
                    req.body = request;
                    next();
                    resolve();
                } else {
                    next();
                    resolve();
                }
            } catch (error) {

                reject(error);
            }
        })
    },




    //**************************************************************ENCRYPTION***********************************************************************//
    encryption: async (req) => {
        return new Promise((resolve, reject) => {
            try {
                const encryptedData = cryptoLib.encrypt(JSON.stringify(req), shakey, process.env.IV);
                resolve(encryptedData);
            } catch (error) {
                reject(error);
            }
        });
    },


    //**************************************************************SEND RESPONSE***********************************************************************//
    sendResponse: (res, resCode, msgKey, resData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const responsejson = {
                    "code": resCode,
                    "message": msgKey
                };
                if (resData != null) {
                    responsejson.data = resData;

                }
                const result = await headerValidator.encryption(responsejson);
                res.send(JSON.stringify(responsejson));
                // resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },





    // validateHeaderToken: async (req, res, next) => {
    //     // 
    //     const bypassMethod = new Array("decryption_demo", "encryption_demo", "singup", "otp-verification", "login", "getuser", "update-role", "category-wise-product", "category-products", "product-details");
    //     const pathData = req.path.split("/");
    //     // 

    //     try {
    //         if (bypassMethod.indexOf(pathData[1]) == -1) {
    //             // var headtoken = crypto.AES.decrypt(req.headers['token'], SECRET, { iv: API_IV }).toString(crypto.enc.Utf8).replace(/\s/g, '');
    //             // var headtoken = req.headers['token'];
    //             var headtoken = req.headers['token'];
    //             var headtoken = (headtoken[0] == '"' ? headtoken.slice(1, -1) : headtoken);
    //             // if ((req.headers.token !== undefined && req.headers.token !== '') ? req.headers.token : '') {
    //                 if ((headtoken !== undefined && headtoken !== '') ? headtoken : '') {
    //                 if (headtoken !== '') {

    //                     // if (req.headers['is_admin'] != undefined && req.headers['is_admin'] == '1') {
    //                     //     try {
    //                     //         const adminDetails = await userModel.findOne({ token: `${headtoken}`, user_type: "admin" })
    //                     //         if (adminDetails) {
    //                     //             req.user_id = adminDetails._id;
    //                     //             next();
    //                     //         } else {
    //                     //             return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
    //                     //         }
    //                     //     } catch (error) {
    //                     //         return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
    //                     //     }
    //                     // } 
    //                     // else {

    //                     try {
    //                         const userDetails = await userModel.findOne({ token: `${headtoken}` })
    //                         if (userDetails) {
    //                             req.user_id = userDetails._id;
    //                             next();
    //                         } else {
    //                             return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
    //                         }
    //                     } catch (error) {
    //                         return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
    //                     }
    //                     // }
    //                 } else {
    //                     return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
    //                 }
    //             } else {
    //                 return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
    //             }
    //         } else {
    //             next()
    //         }
    //     } catch (error) {
    //         return headerValidator.sendResponse(res, Codes.INTERNAL_ERROR, 'An error occurred', null);
    //     }
    // },












    // sendResponse: async (res, resCode, msgKey, resData) => {
    //     try {
    //         const responsejson =
    //         {
    //             "code": resCode,
    //             "message": msgKey
    //         }
    //         if (resData != null) {
    //             responsejson.data = resData;
    //         }
    //         const result = await headerValidator.encryption(responsejson);
    //         res.send(result);
    //     } catch (error) {
    //         
    //     }
    // },



    // decryption: async (req) => {
    //     try {
    //         if (req.body !== undefined && Object.keys(req).length !== 0) {
    //             // const request = JSON.parse(crypto.AES.decrypt(req.body, SECRET, { iv: API_IV }).toString(crypto.enc.Utf8));
    //             // const request = JSON.parse(req.body);
    //             
    //             request.language = req.language;
    //             request.user_id = req.user_id;
    //             return request;
    //         } else {
    //             return false;
    //         }
    //     } catch (error) {
    //         return {};
    //     }
    // },



    // encryption: async (req) => {
    //     try {
    //         // const encryptedData = crypto.AES.encrypt(JSON.stringify(req), SECRET, { iv: API_IV }).toString();
    //         const encryptedData = req;
    //         return encryptedData;

    //     } catch (error) {
    //         return {};
    //     }
    // },



    // decryptionDemo: async (req, res) => {
    //     try {
    //         const decryptedData = JSON.parse(crypto.AES.decrypt(req, SECRET, { iv: API_IV }).toString(crypto.enc.Utf8));
    //         res.json(decryptedData);
    //     } catch (error) {
    //         
    //     }
    // },


    // /**
    //  * Function to encryption demo
    //  * 21-11-2023
    //  * @param {Response Body} req 
    //  * @param {res} res 
    //  */
    // encryptionDemo: function (req, res) {
    //     try {
    //         const encryptData = crypto.AES.encrypt(req, SECRET, { iv: API_IV }).toString();
    //         res.json(encryptData);
    //     } catch (error) {
    //         
    //     }
    // },
};

module.exports = headerValidator;