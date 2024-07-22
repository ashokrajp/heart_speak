var express = require('express')
var router = express.Router()
var service_modal = require('./service_modal')
var middleWare = require('../../middleware/headerValidator')






router.post('/getGeminiChat', (req, res) => {
    service_modal.getGeminiChatListing(req.body, req.login_user_id, (statuscode, responsecode, message, data) => {
        middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
    });

});

router.post('/chatwithgemiAI', (req, res) => {

    console.log("----------------heasder",req.headers);
    var request = req.body
    let rules = {
        prompt: "required",
    }

    let messages = {
        required: req.language.required,
    }

    if (middleWare.checkValidationRules(request, res, rules, messages, {})) {
        service_modal.getResponsegemini(request,req.login_user_id, (statuscode, responsecode, message, data) => {
            middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
        });
    }

});



router.post('/clear_chat', (req, res) => {
    let request=req.body
        service_modal.clear_chat(request,req.login_user_id, (statuscode, responsecode, message, data) => {
            middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
        });
});

router.post('/log_out', (req, res) => {
    let request=req.body
        service_modal.log_Out(request,req.login_user_id, (statuscode, responsecode, message, data) => {
            middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
        });
});





router.post('/login', (req, res) => {

    var request = req.body

    let rules = {
        email: 'required|email',
        password: 'required',

    }

    let messages = {
        required: req.language.required,
        email: req.language.email,
    }

    if (middleWare.checkValidationRules(request, res, rules, messages, {})) {
        service_modal.login(request, (statuscode, responsecode, message, data) => {
            middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
        });
    }
});
router.post('/signup', (req, res) => {

    var request = req.body

    let rules = {
        name: 'required',
        email: 'required',
        password: 'required',

    }

    let messages = {
        required: req.language.required,
        email: req.language.email,
    }

    if (middleWare.checkValidationRules(request, res, rules, messages, {})) {
        service_modal.signup(request, (statuscode, responsecode, message, data) => {
            middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
        });
    }
});


router.post('/userdetails', (req, res) => {

    service_modal.getUserDetails(req.login_user_id, (statuscode, responsecode, message, data) => {
        middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
    });

});



module.exports = router