const express = require('express');
const ServiceController = require('../controller/service_controller')
const router = express.Router();
const cron_model = require('../models/service_model')
const cron = require('node-cron');

/*------------- CHECK FOR ADMIN TOKEN EXPIRATION -------------*/
cron.schedule('5 0 * * *', () => {
// cron.schedule('* * * * * *', () => {
    console.log('CHECKING FOR ADMIN TOKEN EXPIRATION...');
    cron_model.checkDeleteChatHistory();
    cron_model.deleteUserHistory();
});

module.exports = router