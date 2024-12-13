let moment = require('moment');
let mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  
    token: {
        type: String,
        default: null
    },
    email: {
        type: String,
        unique: true,
        default: null
    },
  
    password: {
        type: String,
        require: true
    },

   

})

const userModel = mongoose.model('tbl_user', userSchema);
module.exports = userModel; 