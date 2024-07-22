let Globals = {


    'API_KEY': process.env.API_KEY,
    'KEY': process.env.KEY,
    'IV': process.env.IV,

    'EMAIL_ID': process.env.EMAIL_ID,
    'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
    'OPENAI_API_KEY':process.env.OPENAI_API_KEY,    
    
    'GOOGLE_CLIENT_ID':process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET':process.env.GOOGLE_CLIENT_SECRET,
    'CALLBACK_URL':process.env.CALLBACK_URL,
    
    //ERROR CODE
    'FAILED': 0,
    'SUCCESS': 1,
    'NO_DATA_FOUND': 2,
    'ACCOUNT_INACTIVE': 3,
    'OTP_VERIFICATION': 4,
    'EMAIL_VERIFICATION': 5,
    'FORCE_APP_UPDATE': 6,
    'SIMPLE_APP_UPDATE': 7,
    'UNDER_MAINTENANCE': 8,
    'INCORRECT_LOGIN_TYPE': 11,
    'DEVICE_TABLET_USE': 15,

}

module.exports = Globals;