require('dotenv').config();
const mongoose = require('mongoose');
try{
    mongoose.connect(process.env.MONGODB_URL);
    console.log(`Mongoose Connected!`)
}catch(err){
    console.log(`Connection faild!`,err);
}