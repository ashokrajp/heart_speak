const authModel = require('../models/auth_model');
const Codes = require('../../../../config/status_code')
const checkValidationRule = require('../validations')
const middleware = require('../../../../middleware/headerValidators')

//*==================================================SIGNUP======================================================*//

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  //   const apiKey = process.env.GEMINI_API_KEY;
  //   const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });
  
  const generationConfig = {
    temperature: 0,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2000,
    responseMimeType: "text/plain",
  };
const singup = async (req, res) => {
    const valid = await middleware.checkValidationRules(req.body, checkValidationRule.sigupValidation);

    const request = {
        ...req.body,
    }

    if (valid.status) {
        return authModel.singUp(request, res)
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null)
    }
}

//*==================================================VERIFY OTP======================================================*//

const verifyotp = async (req, res) => {
    const valid = await middleware.checkValidationRules(req.body, checkValidationRule.otpVerification);
    const request = {
        ...req.body,
    }

    if (valid.status) {
        return authModel.verifyOtp(request, res)
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null)
    }
}


//*==================================================RESEND OTP======================================================*//
const resendotp = async (req, res) => {
    const valid = await middleware.checkValidationRules(req.body, checkValidationRule.resendOtp);
    const request = {
        ...req.body,
    }

    if (valid.status) {
        return authModel.resendOtp(request, res)
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null)
    }
}


/*==================================================LOGIN======================================================*/
const login = async (req, res) => {
    console.log("----------------------");
    
    const valid = await middleware.checkValidationRules(req.body, checkValidationRule.login);
    const request = {
        ...req.body,
    }

    if (valid.status) {
        return authModel.login(request, res)
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null)
    }
}


/*==================================================VIEW PROFILE======================================================*/
const getGeminiChat = async (req, res) => {
    req.body.login_user_id = req.user_id

    return authModel.getGeminiChat(req.body, res)
}
/*==================================================VIEW PROFILE======================================================*/
const logout = async (req, res) => {
    req.body.login_user_id = req.user_id

    return authModel.logOut(req.body, res)
}

/*==================================================CHANGE PASSWORD======================================================*/
const checktoken = async (req, res) => {
    console.log("--------------------------------dghello",req.user_id);
    
    const valid = await middleware.checkValidationRules(req.body);

    if (valid.status) {
        const request = {
            ...req.body,
        };
        return authModel.check_token(request, res);
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};
/*==================================================CHANGE PASSWORD======================================================*/
const chatwithgemiAI = async (req, res) => {
    console.log("--------------------------------dghello",req.user_id);
    
    const valid = await middleware.checkValidationRules(req.body, checkValidationRule.chatwithgemiAI);

    if (valid.status) {
        const request = {
            ...req.body,
            userId: req.user_id,
        };
        return authModel.chatwithgemiAI(request, res);
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
};



module.exports = {
    singup,
    verifyotp,
    resendotp,
    logout,
    checktoken,
    login,
    getGeminiChat,
    chatwithgemiAI
}