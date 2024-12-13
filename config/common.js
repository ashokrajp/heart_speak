var globals = require('../config/constant');

var common = {

    // *========================================GENRATE OTP===============================================* //
    async generateOTP() {
        const otp = await Math.floor(1000 + Math.random() * 9000)
        return otp;
    },

    // *========================================GENRATE TOKEN===============================================* //
    generateToken: function (length = 5) {
        let possible = "ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvqxyz0123456789";
        let text = "";
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text;
    },



}

module.exports = common