const express = require('express')
const AuthController = require('../controller/auth_controller')
const router = express.Router();



// router.post('/singup', AuthController.singup)
// router.post('/otp-verification', AuthController.verifyotp)
// router.post('/resend-opt', AuthController.resendotp)
// router.post('/forgot-otp', AuthController.forgototp)
// router.post('/forgot-password', AuthController.forgotpassword)

//hear speak time ///
router.post('/login', AuthController.login)
router.post('/getGeminiChat', AuthController.getGeminiChat)
router.post('/chatwithgemiAI', AuthController.chatwithgemiAI)
router.post('/logout', AuthController.logout)
router.post('/check_token', AuthController.checktoken)
module.exports = router;