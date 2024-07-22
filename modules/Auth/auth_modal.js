var con = require('../../config/database');
var common = require('../../config/common');
var headerValidator = require('../../middleware/headerValidator');
var GLOBALS = require('../../config/constants');
const passport = require('passport');
var cryptoLib = require('cryptlib');

var User = {





    signup: function (request, callback) {


        User.checkUniqueEmailUsernameMobile(request, '', (userData) => {
            // console.log(userData,'user');
            if (userData != null && request.email != userData.email) {
                callback(200, '0', { keyword: 'rest_keywords_invalid_email', components: {} }, null);
            } else {
                common.common_Singleselect(`SELECT * FROM tbl_user WHERE email = '${request.email}' AND password = '${password}'  `, (userDetails, error) => {
                    if (userDetails == null) {
                        let signupObj = {

                            email: request.email,
                            password: request.password,
                            name: request.name,

                        }

                        common.singleInsert('tbl_user', signupObj, (user_id, error) => {

                            common.checkUpdateDeviceInfo(user_id, (token) => {
                                if (token == null) {
                                    callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);
                                } else {
                                    User.getUserDetails(user_id, (statuscode, responsecode, message, userDetails) => {

                                        if (userDetails == null) {
                                            callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, error);
                                        } else {
                                            userDetails.token = token;
                                            callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, userDetails);
                                        }
                                    });
                                }
                            });

                        });
                    } else {
                        common.checkUpdateDeviceInfo(userDetails.id, (token) => {
                            if (token == null) {
                                callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);
                            } else {
                                userDetails.token = token;
                                callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, userDetails);
                            }
                        });
                    }
                });
            }
        });

    },
    login: function (request, callback) {

        con.query(`SELECT u.*  FROM tbl_user u WHERE u.email = 'email' AND u.password='${request.password}' `, function (err, userdetail) {
            if (!err && userdetail.length > 0) {
                userdetail = userdetail[0];
                common.checkUpdateDeviceInfo(userdetail.id, function (token) {
                    updatedUserDetail.token = token
                    if (updatedUserDetail == null) {
                        callback('2', {
                            keyword: 'rest_keyword_user_null',
                            components: {}
                        }, {});
                    } else {
                        callback("1", {
                            keyword: "rest_keywords_success",
                            content: {}
                        }, updatedUserDetail);

                    }
                })


            } else {
                callback(0, {
                    keyword: 'something went wrong',
                    components: {}
                }, null);
            }
        });
    },


    checkUniqueEmailUsernameMobile: function (request, login_user_id, callback) {
        var condition = login_user_id != undefined && login_user_id != "" ? `id != ${login_user_id} AND` : '';
        // console.log(condition, "dfdsfdfd");
        var q = con.query(`SELECT * FROM tbl_user WHERE ${condition} email = '${request.email}'`, (error, result) => {
            // console.log(q);
            // console.log(result, "result");
            // console.log(error, "error");
            if (!error && result.length > 0) {
                callback(result[0]);
            } else {
                callback(null);
            }
        });
    },


    getUserDetails: function (user_id, callback) {
        common.common_Singleselect(`SELECT u.id,u.email,u.password, IFNULL(u.token,'') as token FROM tbl_user u WHERE u.id = ${user_id} `, (userDetails, error) => {
            if (userDetails == null) {
                callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);
            } else {
                callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, userDetails);
            }
        });
    },


}

module.exports = User;               