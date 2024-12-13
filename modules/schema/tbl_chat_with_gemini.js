let moment = require('moment');
let mongoose = require('mongoose')

const chatWithGeminiSchema = mongoose.Schema({
  


        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User' // Assuming user references a 'User' model
        },
        name: {
            type: String,
            required: true
        },
        user_prompt: {
            type: String
        },
        text: {
            type: String
        },
        created_at: {
            type: Date,
            default: moment().toDate()
        }
   

})

const chatModel = mongoose.model('tbl_chat_with_gemini', chatWithGeminiSchema);
module.exports = chatModel; 