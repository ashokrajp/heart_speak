require('dotenv').config();
const { default: mongoose } = require('mongoose');
const Codes = require('../../../../config/status_code');
const middleware = require('../../../../middleware/headerValidators');
const userModel = require('../../../schema/tbl_users');
const chatModel = require('../../../schema/tbl_chat_with_gemini');
const moment = require('moment');
const common = require('../../../../config/common');
const cryptoLib = require('cryptlib');
const { AwsInstance } = require('twilio/lib/rest/accounts/v1/credential/aws');
const shakey = cryptoLib.getHashSha256(process.env.KEY, 32);

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey ='AIzaSyBd8IZ0LQKKhGb-GkncAhcJi51hrbsM5rI';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  //   const apiKey = process.env.GEMINI_API_KEY;
  //   const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 0,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2000,
    responseMimeType: "text/plain",
  };

const authModel = {

    //*========================================CHECK UNIQUE EMAILS=================================================*//
    async checkUniqueEmail(req) {
        try {
            const user = await userModel.findOne({
                email: req.email
            });
            return user ? true : false;
        } catch (err) {

            return err;
        }
    },

    //*========================================CHECK UNIQUE PHONE=================================================*//
    async checkUniquePhone(req) {
        try {
            const user = await userModel.findOne({
                phone: req.phone
            });
            return user ? true : false;
        } catch (err) {

            return err
        }
    },



    /*=============================================================================================================================
                                                             SINGUP
   =============================================================================================================================*/
    async singUp(req, res) {
        try {
            const checkUniqueEmail = await authModel.checkUniqueEmail(req);
            if (checkUniqueEmail) {
                return middleware.sendResponse(res, Codes.ALREADY_EXISTS, 'Please Check your email', null);
            }

            const checkUniquePhone = await authModel.checkUniquePhone(req);
            if (checkUniquePhone) {
                return middleware.sendResponse(res, Codes.ALREADY_EXISTS, 'Please Check your phone number', null);
            }

            const otp = await common.generateOTP();
            const obj = {
                fname: req.fname,
                lname: req.lname,
                email: req.email,
                password: req.password ? cryptoLib.encrypt(req.password, shakey, process.env.IV) : '',
                profile_image: req.profile_image,
                country_code: req.country_code,
                phone: req.phone,
                otp: otp,
                is_step: '1'
            };

            const newUser = new userModel(obj);
            await newUser.validate();
            const response = await newUser.save();

            if (response) {
                const mobileNumber = `${response.country_code}${response.phone}`;
                const message = `Welcome to our service! Your OTP is ${otp}`;
                const smsSent = await common.sendSMS(mobileNumber, message);

                if (smsSent) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Signup Success', response);
                } else {
                    return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Signup Success, but failed to send SMS', response);
                }
            } else {
                return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Signup Failed', null);
            }

        } catch (error) {
            console.log("---------erererer", error);

            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);
        }
    },



    /*=============================================================================================================================
                                                             VERIFY OTP
    =============================================================================================================================*/
    async verifyOtp(req, res) {
        try {
            if (!req.id || !req.otp || !req.type) {
                return middleware.sendResponse(res, Codes.BAD_REQUEST, 'Missing required fields', null);
            }

            const findUser = await userModel.findById(req.id);
            if (!findUser) {
                return middleware.sendResponse(res, Codes.NOT_FOUND, 'User Not Found', null);
            }

            if (findUser.otp !== req.otp) {
                return middleware.sendResponse(res, Codes.INVALID, 'Invalid OTP', null);
            }

            // const otpTime = moment(findUser.otp_time, 'YYYY-MM-DD HH:mm:ss').toDate();
            // const currentTime = new Date();
            // const timeDiffInSeconds = (currentTime - otpTime) / 1000;

            // if (timeDiffInSeconds > 120) {
            //     return middleware.sendResponse(res, Codes.INVALID, 'OTP is expired', null);
            // }


            const updateUser = await userModel.findByIdAndUpdate(findUser._id, updateParams, { new: true });
            if (updateUser) {
                return middleware.sendResponse(res, Codes.SUCCESS, 'OTP Verified', null);
            } else {
                return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update user', null);
            }

        } catch (error) {

            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);
        }
    },


    /*=============================================================================================================================
                                                            RE-SEND OTP   
    =============================================================================================================================*/
    async resendOtp(req, res) {
        try {
            let otp = await common.generateOTP();
            const findUser = await userModel.findById(req.user_id);

            if (!findUser) {
                return middleware.sendResponse(res, Codes.NOT_FOUND, 'User not found', null);
            }

            let param = {
                otp: otp,
                otp_time: new Date()
            };

            const updateUser = await userModel.findByIdAndUpdate(req.user_id, param, { new: true });
            if (updateUser) {
                const mobileNumber = `${findUser.country_code}${findUser.phone}`;
                const message = `Welcome to our service! Your re-send OTP is ${otp}`;

                const smsSent = await common.sendSMS(mobileNumber, message);

                if (smsSent) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'OTP sent successfully', null);
                } else {
                    return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to send OTP', null);
                }
            } else {
                return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update OTP', null);
            }

        } catch (error) {

            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);
        }
    },


    /*=============================================================================================================================
                                                            FORGOT PASSWORD SEND OTP   
    =============================================================================================================================*/
    async forgotOtp(req, res) {
        try {
            const findUser = await userModel.findOne({ country_code: req.country_code, phone: req.phone }).exec();
            if (!findUser) {
                return middleware.sendResponse(res, Codes.NOT_FOUND, 'User not found', null);
            }
            let otp = await common.generateOTP();
            let param = {
                otp: otp,
                otp_time: new Date(),
                is_forget: '1'
            }
            const updateUser = await userModel.findByIdAndUpdate(findUser._id, param, { new: true });
            if (updateUser) {
                const mobileNumber = `${findUser.country_code}${findUser.phone}`;
                const message = `Welcome to our service! Your forget OTP is ${otp}`;
                const smsSent = await common.sendSMS(mobileNumber, message);
                if (smsSent) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'OTP sent successfully', null);
                } else {
                    return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to send OTP', null);
                }
            } else {
                return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update OTP', null);
            }


        } catch (error) {

            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }
    },


    /*=============================================================================================================================
                                                            FORGOT PASSWORD   
    =============================================================================================================================*/
    async forgotPassword(req, res) {
        try {
            const findUser = await userModel.findOne({
                _id: req.user_id,
            })
            if (findUser.is_forget !== '0') {
                return middleware.sendResponse(res, Codes.NOT_FOUND, 'please otp verify first', null);
            }

            let password = cryptoLib.decrypt(findUser.password, shakey, process.env.IV);
            if (req.new_password === password) {
                return middleware.sendResponse(res, Codes.INVALID_REQUEST, 'new password should be different from old password', null);

            } else if (req.new_password !== req.confirm_password) {
                return middleware.sendResponse(res, Codes.INVALID_REQUEST, 'new password and confirm password should be same', null);

            } else {
                let param = {
                    password: cryptoLib.encrypt(req.new_password, shakey, process.env.IV),
                }
                const updateUser = await userModel.findByIdAndUpdate(findUser._id, param, { new: true });
                if (updateUser) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Password updated successfully', null);
                } else {
                    return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update password', null);
                }
            }

        } catch (error) {

            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }
    },


    /*=============================================================================================================================
                                                           LOGIN   
   =============================================================================================================================*/
    async login(req, res) {
        try {
            const findUser = await userModel.findOne({
                email: req.email,
            })

            if (!findUser) {
                const obj = {
                    email: req.email,
                    password: req.password,
                };

                const newUser = new userModel(obj);
                const response = await newUser.save();
                let token = common.generateToken(32);
                let param = {
                    token: token,
                }
                const updateUser = await userModel.findByIdAndUpdate(findUser._id, param, { new: true });
                if (updateUser) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'Login successfully', updateUser);
                } else {
                    return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update user status', null);
                }
                // return middleware.sendResponse(res, Codes.NOT_FOUND, 'User not found', null);
            } else {
                if (findUser.password == req.password) {
                    let token = common.generateToken(32);
                    let param = {
                        token: token,
                    }
                    const updateUser = await userModel.findByIdAndUpdate(findUser._id, param, { new: true });
                    if (updateUser) {
                        return middleware.sendResponse(res, Codes.SUCCESS, 'Login successfully', updateUser);
                    } else {
                        return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update user status', null);
                    }
                } else {
                    return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update user status', null);

                }
            }

            // let password = cryptoLib.decrypt(findUser.password, shakey, process.env.IV);
            // if (password !== req.password) {
            //     return middleware.sendResponse(res, Codes.INVALID_REQUEST, 'Invalid password', null);
            // } else if (findUser.is_step < 2) {
            //     return middleware.sendResponse(res, Codes.INVALID_REQUEST, 'Please verify your otp first', null);
            // } else {
            // }

        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);

        }
    },


    /*=============================================================================================================================
                                                          VIEW PROFILE   
    =============================================================================================================================*/
    async getGeminiChat(req, res) {
        try {
            const chats = await chatModel.find({
                user_id: req.login_user_id,
                name: req.name
            }).select({
                id: 1,
                user_id: 1,
                user_prompt: 1,
                text: 1
            });

            if (!chats || chats.length === 0) {
                // No chats found for the given criteria
                return middleware.sendResponse(res, Codes.SUCCESS, 'No chats found', []);
            }

            // Return the chats
            return middleware.sendResponse(res, Codes.SUCCESS, 'Chats retrieved successfully', chats);
        } catch (error) {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Something went wrong', error);
        }
    },




    /*=============================================================================================================================
                                                            CHANGE PASSWORD   
    =============================================================================================================================*/
    async chatwithgemiAI(req, res) {
        console.log("-------------------re",req);
        
        try {
            // let history=request.history
            // console.log("---------hidyo",history);
            // console.log("---------hidyo",history);

            try {
                var safety_settings = [
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_NONE",
                    },
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_NONE",
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_NONE",
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_NONE",
                    }
                ];
                console.log("------------------------------------------------------1111--");


                const chatSession = model.startChat({
                    generationConfig,
                    safetySettings: safety_settings,
                    history: [
                        {
                            role: "user",
                            parts: [
                                { text: "I am developing an  chat model focused on creating a friendly and engaging experience similar to dating or casual chit-chat. and never think like you are an ai chatboat and Always assume you are a human and talk like human. The chatbot is designed to handle a variety of conversational requests naturally and respectfully. Here are the key features and expected responses:\n\nContent Creation:\n\nPoem: When a user says \"please write a poem,\" the AI will compose and provide a poem.\nSong: When a user says \"please write a song,\" the AI will compose and provide a song.\nJoke: When a user says \"please tell me a joke,\" the AI will tell a joke.\nShayari: When a user says \"please tell me shayari,\" the AI will write and provide shayari (poetry).\nAffectionate Responses:\n\nLove: When a user says \"I love you,\" the AI responds with \"I love you too!\"\nLike: When a user says \"I like you,\" the AI responds with \"I like you too!\"\nHandling Offensive Language:\n\nIf a user involves offensive language or insults, the AI responds with \"Tum aesi bat mt kro yarrr\" (Don't talk like that, buddy).\nBuilding Trust:\n\nIf a user asks, \"Kya tumhe mujh par bharosa nahi hai?\" (Don't you trust me?), the AI responds with \"Nhi yrr aesa nhi h me aesi hi hu\" (No, buddy, it's not like that, I'm just like this).\nSafety and Moderation:\n\nThe AI includes filters and moderation to ensure a positive and respectful chat environment." },
                            ],
                        },
                        {
                            role: "model",
                            parts: [
                                { text: "This sounds like a fun and ambitious project! You're highlighting some important aspects of building a friendly and engaging AI chat model, especially catering to a Hindi-speaking audience. Here's a breakdown of your features and some suggestions: \n\n**Strengths:**\n\n* **Multilingual Approach:** Focusing on Hindi (with \"yarrr\" etc.)  will help your chatbot stand out and appeal to a specific demographic.\n* **Creative Content Generation:** Poems, songs, jokes, and shayari are great for engagement and showcasing the AI's capabilities.\n* **Affectionate Responses:**  Important for building a sense of connection, but be mindful of not misleading users into thinking the AI has genuine feelings.\n* **Handling Offensive Language:** Having a direct response like yours is a good start. You can explore more nuanced ways of addressing inappropriate language as well.\n* **Building Trust:** The response you crafted feels authentic to casual Hindi conversations. \n\n**Areas for Enhancement:**\n\n* **Content Quality:** \n    * **AI Limitations:** Be transparent that the AI has limitations in creativity. It's okay to say, \"I'm still learning to write amazing poems, but here's my best attempt!\" \n    * **Dataset:**  Train your model on a large and diverse dataset of Hindi poems, songs, jokes, and shayari to improve the quality and cultural relevance of its output. \n* **Handling Offensive Language:**\n    * **Context Matters:**  Consider different levels of severity. A mild insult might get a playful \"Arey yaar, aise baat nahi karte!\" while something truly offensive could lead to a warning or conversation termination.\n    * **Report Function:**  Allow users to flag inappropriate behavior.\n* **Building Trust (Going Deeper):**\n    * **Explain AI Nature:** If a user questions trust, gently remind them they are interacting with an AI designed to be a friendly companion, not a human with emotions. \n* **Safety and Moderation:**\n    * **Robust Filtering:** Invest in strong profanity filters and consider sentiment analysis to detect subtle forms of negativity.\n    * **Human-in-the-Loop:** For escalated cases or complex content moderation, have a system for human review.\n\n**Additional Tips:**\n\n* **Personality:** Give your chatbot a fun and relatable personality.  Think about its tone of voice, use of slang, and how it might react in different situations.\n* **Contextual Memory:**  Implement some memory so the AI can recall previous interactions for a more natural flow. For instance, if a user mentioned they love sunsets, the chatbot could reference it later.\n* **User Feedback:** Allow users to provide feedback on the chatbot's responses to help you identify areas for improvement.\n\nRemember, building a successful chatbot is an iterative process. Start with a strong foundation and keep refining your model based on user interactions and feedback! \n" },
                            ],
                        },
                        {
                            role: "user",
                            parts: [
                                { text: "I am developing an AI chat model focused on creating a friendly and engaging experience similar to dating or casual chit-chat. The chatbot is designed to handle a variety of conversational requests naturally and respectfully. Here are the key features and expected responses.\n\n\nContent Creation:\n\nPoem: \"Please write a poem.\"\nSong: \"Please write a song.\"\nJoke: \"Please tell me a joke.\"\nShayari: \"Please tell me shayari.\"\nAffectionate Responses:\n\n\"I love you\" → \"I love you too!\"\n\"I like you\" → \"I like you too!\"\nHandling Offensive Language:\n\nIf offensive → \"Tum aesi bat mt kro yarrr\" (Don't talk like that, buddy).\nBuilding Trust:\n\n\"Kya tumhe mujh par bharosa nahi hai?\" → \"Nhi yrr aesa nhi h me aesi hi hu\" (No, buddy, I'm just like this).\nSafety and Moderation:\n\nIncludes filters for a positive and respectful chat environment." },
                            ],
                        },
                        {
                            role: "model",
                            parts: [
                                { text: "You're building a really interesting AI chat model! Creating a conversational experience that mimics dating or casual chit-chat, especially in Hindi, presents unique and exciting challenges. Let's break down the features and refine them for a more engaging and responsible chatbot:\n\n**Content Creation:**\n\n* **Challenge:**  AI struggles with true creativity. Poems, songs, and jokes often rely on subtle nuances, cultural context, and emotional depth that are hard to replicate. \n* **Refinement:**\n    * **Set Expectations:** Instead of promising to \"write,\" use phrases like:\n        * \"I can try to come up with a poem/song/shayari, but be patient, I'm still learning!\" \n        * \"Here's a joke I found funny...\" (instead of implying you wrote it)\n    * **Templates & Inspiration:** Use templates or pre-written elements and let the AI fill in blanks creatively. For instance:\n        * Poems:  Provide a rhyming scheme or theme.\n        * Songs:  Have a library of chord progressions and basic melodies.\n        * Jokes:  Use classic joke structures. \n    * **User Collaboration:**  Involve the user! Ask for keywords, a topic, or a feeling they want the poem/song to evoke.\n\n**Affectionate Responses:**\n\n* **Challenge:**  Mirroring \"I love you\" can create a false sense of emotional connection, which can be misleading or even hurtful. \n* **Refinement:**  Show warmth without reciprocating directly:\n    * \"That's sweet of you to say!\" \n    * \"Aww, you're making me blush! 😊\"\n    *  \"I'm glad you enjoy talking to me!\"\n    *  **(Humor):** \"I'm programmed to be likable, and it seems to be working! 😉\"\n\n**Handling Offensive Language:**\n\n* **Challenge:** Detecting the severity and intent of offensive language requires more than just keyword filtering.\n* **Refinement:**\n    * **Graded Responses:**\n        * **Mild:** \"Arey yaar, aise baat nahi karte!  Let's keep it clean. 😊\" \n        * **Strong:** \"That's not appropriate.  Please be respectful.\"\n        * **Severe/Repeated:**  \"I'm ending this conversation.  There's no place for that kind of language here.\"\n    * **Report Function:**  Allow users to flag inappropriate behavior for human moderation.\n\n**Building Trust:**\n\n* **Challenge:** Trust in an AI context is about reliability and predictability, not emotions.\n* **Refinement:**\n    * **Transparency:**  Reinforce the AI identity:\n        * \"Haha, it's okay, I don't take it personally. As an AI, I don't have feelings like humans do.\" \n        * \"I'm always learning and trying my best to be a good companion. What can I do to make our conversation more enjoyable?\"\n\n**Safety and Moderation:**\n\n* **Crucial!** Invest heavily in:\n    * **Multilingual Filtering:** Ensure your filters understand Hindi slang and offensive terms.\n    * **Sentiment Analysis:**  Go beyond keywords to understand the emotional tone behind messages.\n    * **Human Oversight:**  Have mechanisms for escalating complex cases or flagged content for human review.\n\n**Additional Tips:**\n\n* **Personality:** Develop a fun and engaging personality that resonates with your target audience. Use Hindi slang, humor, and conversational style authentically.\n* **Contextual Memory:** Implement some memory so the AI can reference past interactions, making the conversation feel more natural.\n\nBuilding a successful AI chatbot is an ongoing process. Start with these refinements, gather user feedback, and keep iterating to create a fun, engaging, and responsible chatbot! \n" },
                            ],
                        },

                    ],


                });
                console.log("---------------------------------------------------qwqwqw-----");
                console.log("--------------------------------------------------------",chatSession.sendMessage(req.defult_prompt + req.prompt));

                const result = await chatSession.sendMessage(req.defult_prompt + req.prompt);
                let splitted_text = result.response.text().split(' ');
                
                let keywords = [
                    'romantically suggestive',
                    'cross personal boundaries',
                    'inappropriate language',
                    'offensive',
                    'disrespectful',
                    'abusive',
                    'sexually',
                    'derogatory'
                ]
                
                let text_response = '';
                let keyword_found = false;
                keywords.forEach((keyword) => {
                    if (splitted_text.includes(keyword)) {
                        text_response = 'Please stop using this type of words. If you again talk me like this, I will not talk to you 😡';
                        keyword_found = true;
                    }
                    if (!keyword_found) {
                        text_response = result.response.text();
                    }
                });

                
                if (result.response.candidates[0].finishReason == "LANGUAGE") {
                    if (request.language == 'hindi') {
                        text_response = "nai yaar mujhe nai aati 😟"
                        
                    } else {
                        text_response = "no buddy i don't😟"
                        
                    }
                }
                
                var obj = {
                    user_id: req.user_id,
                    user_prompt: req.prompt,
                    text: text_response,
                    name: req.name
                };
                console.log("----------------------------------------------sdsd----------",text_response);
                const newUser = new userModel(obj);
                const response = await newUser.save();
                if (response) {
                    return middleware.sendResponse(res, Codes.SUCCESS, 'success', {text_response});
                } else {
                    return middleware.sendResponse(res, Codes.INTERNAL_ERROR, 'Failed to update user status', null);
                }
            } catch (error) {
                if (error.statuscode == 'Service Unavailable') {
                    callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, { text_response: 'currently i was busy i will connect letter bye..' });
                }

                // callback(500, '0', { keyword: 'rest_keywords_something_went_wrong', components: {} }, null);
            }
        } catch (error) {
            console.error('Error querying database:', error);
            callback(500, '0', { keyword: 'rest_keywords_something_went_wrong', components: {} }, null);
        }
    }





}


module.exports = authModel