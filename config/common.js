var con = require("./database");
var GLOBALS = require('./constants')

var Validate = {
  generateSessionCode: function (user_id, request, callback) {

    // console.log("request",request);
    var randtoken = require("rand-token").generator();
    var usersession = randtoken.generate(64,"0123456789abcdefghijklnmopqrstuvwxyz");

    Validate.checkDeviceInfo(user_id, function (DeviceInfo,err) {
      if (DeviceInfo != null) {
          console.log("-------------- devie data-",DeviceInfo);
          var params = {
            token: usersession,
          };
          Validate.updateDeviceInfo(user_id, params, function () {
            callback(usersession);
          });
        } else {
          var params = {
            user_id: user_id,
            token: usersession,
          };
          console.log(params,"prana");
          Validate.addDeviceInformation(params, function (data) {
            // console.log(usersession);
            callback(usersession);
          });
        }
      }
    );
  },

  checkDeviceInfo: function (user_id, callback) {
    con.query("SELECT * FROM tbl_user WHERE id = '" + user_id + "' ", function (err, result) {
        if (!err && result[0] != undefined) {
          callback(result[0]);
        } else {
          callback(null, err);
        }
      }
    );
  },

  updateDeviceInfo: function (user_id, params, callback) {
    console.log("-----------this.sql",params);
    con.query("UPDATE tbl_user SET ? WHERE id = '" + user_id + "' ", params, function (err, result, fields) {
        callback(result);
    });
  },

  addDeviceInformation: function (params, callback) {
    con.query("INSERT INTO tbl_user SET ?", params, function (err, result, fields) {
        callback(result);
    });
  },

  checkUpdateDeviceInfo: function (user_id, callback) {

    var randtoken = require("rand-token").generator();
    var usersession = randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz");

    var upd_device = {
      token: usersession,
    };

    Validate.checkDeviceInfo(user_id, function (DeviceInfo, Error) {
      if (DeviceInfo != null) {
          Validate.updateDeviceInfo(user_id, upd_device, function (result, error) {
              callback(usersession);
          });
      } else {
          upd_device.user_id = user_id;
          Validate.addDeviceInformation(upd_device, function (result) {
            callback(usersession);
          });
      }
    });
  },

  
  /*
   ** Common Single Insert operation
   ** 12-08-2022
   */

  singleInsert: function (tablename, params, callback) {
    con.query(
      "INSERT INTO " + tablename + " SET ?",
      params,
      function (error, result, fields) {
        if (!error) {
          callback(result.insertId, error);
        } else {
          console.log(error);
          callback(null, error);
        }
      }
    );
  },

  /*
   ** Common Single update operation
   ** 12-08-2022
   */
  singleUpdate: function (tablename, params, condition, callback) {
    con.query(
      "UPDATE " + tablename + " SET ? WHERE " + condition + " ",
      params,
      function (error, result, fields) {
        if (!error) {
          callback(result, error);
        } else {
          console.log(error);
          callback(null, error);
        }
      }
    );
  },

  /*
   ** Common Delete function
   ** 12-08-2022
   */
  singleDelete: function (tablename, condition, callback) {
    con.query(
      "DELETE FROM " + tablename + " WHERE " + condition + " ",
      function (error, result, fields) {
        if (!error) {
          callback(result, error);
        } else {
          console.log(error);
          callback(null, error);
        }
      }
    );
  },

    /**
   * Function to send email to users
   * @param {subject} subject
   * @param {to email} to_email
   * @param {message} message
   * @param {Function} callback
   */
  send_email: function (subject, to_email, message, callback) {
    var transporter = require("nodemailer").createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: 'infosyskuchbhi@gmail.com',
        pass: 'dzycuynjqxjtpvtv',
      },
    });

    var mailOptions = {
      from: 'infosyskuchbhi@gmail.com',
      to: to_email,
      subject: subject,
      html: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        callback(error);
      } else {
        callback(true);
      }
    });
  },

  randomOTPgenerator: function () {
    var seq = (Math.floor(Math.random() * 1000000) + 1000000)
      .toString()
      .substring(1);
    // console.log(seq);
    return seq;
    // return '0123';
  },

  randomCODEgenerator: function (length) {
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  },

  /*
   ** Common Delete function
   ** 15-12-2022
   */

  getCommonSingleRecord: function (tablename, condition, callback) {
   var q =  con.query(
      "SELECT * from " + tablename + " WHERE " + condition + " ",
      function (error, result, fields) {
      // console.log(q.sql,'dssadsdsdsdsad');

        if (!error) {
          callback(result[0], error);
        } else {
          console.log(error);
          callback([], error);
        }
      }
    );
  },

  /*
   ** Common get Multiple record function
   **  20-12-2022
   */
  getCommonMultipleRecord: function (tablename, condition, callback) {
    con.query(
      "SELECT * from " + tablename + " WHERE " + condition + " ",
      function (error, result, fields) {
        if (!error) {
          callback(result, error);
        } else {
          console.log(error);
          callback([], error);
        }
      }
    );
  },

 

  //common single select tabel details
  common_Singleselect: function (query, callback) {
    //select query
    con.query(query, function (err, result, fields) {
      // console.log(this.sql);
      if (!err && result.length > 0) {
        callback(result[0]);
      } else {
        if (err) {
          console.log("Common single Select Error :- ", err);
        }
        callback(null);
      }
    }); //end select query
  },

  //common Multiple select tabel details
  common_Multipleselect: function (query, callback) {
    //select query
    con.query(query, function (err, result, fields) {
      console.log(this.sql);
      // return
      if (!err && result.length > 0) {
        callback(result);
      } else {
        if (err) {
          console.log("Common Multiple Select Error :- ", err);
        }
        callback(null);
      }
    }); //end select query
  },

  //common insert tabel details
  common_insert: function (tabelname, insparam, callback) {
    //insert query
    con.query(
      "INSERT INTO " + tabelname + " SET ?",
      insparam,
      function (err, result, fields) {
        if (!err) {
          callback(result.insertId);
        } else {
          console.log("Common insert Error :- ", err);
          callback(0);
        }
      }
    ); //end insert query
  },


   //common single select tabel details
   commonSingleSelect: function (query, callback) {
    //select query
      con.query(query, function (err, result, fields) {
      // console.log(q);
      if (!err && result.length > 0) {
        callback(result[0]);
      } else {
        if (err) {
          console.log(err);
          console.log("Common single Select Error :- ", err);
        }
        callback(null);
      }
    }); //end select query
  },
  
  randomStringGenerate:function()
  {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < 6) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      return result;
  }

};


module.exports = Validate;