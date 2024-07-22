var express = require('express');
var router = express.Router();
var middleWare = require('../../middleware/headerValidator');
var user = require('./auth_modal');



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
        user.login(request, (statuscode, responsecode, message, data) => {
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
        user.signup(request, (statuscode, responsecode, message, data) => {
            middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
        });
    }
});


router.post('/userdetails', (req, res) => {

    user.getUserDetails(req.login_user_id, (statuscode, responsecode, message, data) => {
        middleWare.sendresponse(req, res, statuscode, responsecode, message, data);
    });

});





module.exports = router;


