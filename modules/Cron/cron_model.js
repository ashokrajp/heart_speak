const common = require('../../config/common');
const asyncLoop = require('node-async-loop');
const user_model = require('../Auth/auth_modal');
var con = require('../../config/database');

const cron_model = {

    /*
    ** Function to check and delete admin token that existed more than 59 days
    */
    checkDeleteChatHistory: function() {
        console.log("-------------------------");
       con.query(`DELETE FROM tbl_chat_with_gemini c where created_at < NOW() `,function(err,result){
        if (!err ) {
            console.log('Something went wrong on delete chat :',err);

        } else {
            console.log('Deleted old chat history:');
        }
       })
    },



}

module.exports = cron_model;
