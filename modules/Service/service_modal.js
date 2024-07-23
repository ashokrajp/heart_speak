var con = require('../../config/database');
var common = require('../../config/common');
var moment = require('moment')
var template = require('../../config/template')
var asyncLoop = require('node-async-loop');
const messages = require('../../languages/en');
var GLOBALS = require('../../config/constants');
const axios = require('axios');

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
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0,
  topP: 1,
  topK: 1,
  maxOutputTokens: 500,
  responseMimeType: "text/plain",
};

var services =
{


  getGeminiChatListing: function (request, login_user_id, callback) {
    console.log("------------re", request);
    console.log("------------login_user_id", login_user_id);
    console.log("------------login_user_id", login_user_id);
    common.common_Multipleselect(`SELECT 
    c.id,
    c.user_id,
    CONVERT(c.user_prompt USING 'utf8mb4') AS user_prompt,
    CONVERT(c.text USING 'utf8mb4') AS text
FROM 
    tbl_chat_with_gemini c  
WHERE 
    c.user_id = '${login_user_id}' AND c.name='${request.name}';
 `, (response) => {
      console.log(this.sql);
      if (response != null) {
        callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, response);

      } else {
        callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);

      }
    })
  },
  clear_chat: function (request, login_user_id, callback) {
    console.log("------------rceeeee", request);
    console.log("------------login_user_id", login_user_id);
    con.query(`DELETE FROM tbl_chat_with_gemini  where user_id='${login_user_id}' AND name='${request.name}'`, function (err, result) {
      console.log("thissss", this.sql);
      if (!err) {
        callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, null);

      } else {
        callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);

      }
    })

  },
  log_Out: function (request, login_user_id, callback) {
    console.log("------------rceeeee", request);
    console.log("------------login_user_id", login_user_id);
    con.query(`UPDATE  tbl_user  SET token='' where id='${login_user_id}'`, function (err, result) {
      console.log("thissss", this.sql);
      if (!err) {
        callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, null);

      } else {
        callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);

      }
    })

  },


  getResponsegemini: async function (request, user_id, callback) {
    try {
      let history=request.history
      // console.log("---------hidyo",history);
      console.log("---------hidyo",history);

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
            ...history
          ],


        });

        const result = await chatSession.sendMessage(request.defult_prompt + request.prompt);
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

        var insertObj = {
          user_id: user_id,
          user_prompt: request.prompt,
          text: text_response,
          name: request.name
        };
        common.singleInsert(`tbl_chat_with_gemini`, insertObj, (chat_id, error) => {
          if (!error) {
            callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, { text_response,history });
          } else {
            callback(200, '0', { keyword: 'rest_keywords_something_went_wrong', components: {} }, null);
          }
        });
      } catch (error) {
        console.error('Error generating content:', error);
        callback(500, '0', { keyword: 'rest_keywords_something_went_wrong', components: {} }, null);
      }
    } catch (error) {
      console.error('Error querying database:', error);
      callback(500, '0', { keyword: 'rest_keywords_something_went_wrong', components: {} }, null);
    }

  },






  login: function (request, callback) {


    // services.checkUniqueEmailUsernameMobile(request, '', (userData) => {
    //     // console.log(userData,'user');
    //     if (userData != null && request.email != userData.email) {
    //         callback(200, '0', { keyword: 'rest_keywords_invalid_email', components: {} }, null);
    //     } else {
    common.common_Singleselect(`SELECT * FROM tbl_user WHERE email = '${request.email}' AND password = '${request.password}'  `, (userDetails, error) => {
      if (userDetails == null) {
        let signupObj = {

          email: request.email,
          password: request.password,

        }

        common.singleInsert('tbl_user', signupObj, (user_id, error) => {

          common.checkUpdateDeviceInfo(user_id, (token) => {
            if (token == null) {
              callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);
            } else {
              services.getUserDetails(user_id, (statuscode, responsecode, message, userDetails) => {

                if (userDetails == null) {
                  callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, error);
                } else {
                  userDetails.token = token;
                  callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, userDetails);
                }
              });
            }
          });

        });
      } else {
        common.checkUpdateDeviceInfo(userDetails.id, (token) => {
          if (token == null) {
            callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);
          } else {
            userDetails.token = token;
            callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, userDetails);
          }
        });
      }
    });
    // }
    // });

  },
  // login: function (request, callback) {

  //     con.query(`SELECT u.*  FROM tbl_user u WHERE u.email = '${request.email}' AND u.password='${request.password}' `, function (err, userdetail) {
  //       console.log("------this.loggg",this.sql);
  //         if (!err && userdetail.length > 0) {

  //             userdetail = userdetail[0];
  //             common.checkUpdateDeviceInfo(userdetail.id, function (token) {
  //               userdetail.token = token
  //                 if (userdetail == null) {
  //                     callback(200,'2', {
  //                         keyword: 'rest_keyword_user_null',
  //                         components: {}
  //                     }, {});
  //                 } else {
  //                     callback(200,"1", {
  //                         keyword: "rest_keywords_success",
  //                         content: {}
  //                     }, userdetail);

  //                 }
  //             })


  //         } else {
  //             callback(200,0, {
  //                 keyword: 'something went wrong',
  //                 components: {}
  //             }, null);
  //         }
  //     });
  // },


  checkUniqueEmailUsernameMobile: function (request, login_user_id, callback) {
    var condition = login_user_id != undefined && login_user_id != "" ? `id != ${login_user_id} AND` : '';
    // console.log(condition, "dfdsfdfd");
    var q = con.query(`SELECT * FROM tbl_user WHERE ${condition} email = '${request.email}'`, (error, result) => {
      // console.log(q);
      // console.log(result, "result");
      // console.log(error, "error");
      if (!error && result.length > 0) {
        callback(result[0]);
      } else {
        callback(null);
      }
    });
  },


  getUserDetails: function (user_id, callback) {
    common.common_Singleselect(`SELECT u.id,u.email,u.password, IFNULL(u.token,'') as token FROM tbl_user u WHERE u.id = ${user_id} `, (userDetails, error) => {
      if (userDetails == null) {
        callback(200, '2', { keyword: 'rest_keywords_nodata', components: {} }, null);
      } else {
        callback(200, '1', { keyword: 'rest_keywords_success', components: {} }, userDetails);
      }
    });
  },
}




module.exports = services









// router.post('/chat', async (req, res) => {

//     await openai.createCompletion({
//         model: "text-davinci-003",
//         max_tokens: 512,
//         temperature: 0,
//         prompt: req.body.prompt
//     }).then((response) => {
//         res.send(response.data.choices[0].text);
//     }).catch((error) => {
//         res.send(error);
//     });

// });