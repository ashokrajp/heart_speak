const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const cron_model = require('./cron_model');


/*------------- CHECK FOR ADMIN TOKEN EXPIRATION -------------*/
cron.schedule('5 0 * * *', () => {
// cron.schedule('* * * * * *', () => {
    console.log('CHECKING FOR ADMIN TOKEN EXPIRATION...');
    cron_model.checkDeleteChatHistory();
});



module.exports = router;
