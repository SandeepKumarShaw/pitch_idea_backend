
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Config = require('../Config');

let messages= new Schema({
    senderId:{type: Schema.ObjectId, ref: 'Users',index:true},
    message: {type: String,default:""},
    imageUrl:{
        original:{type:String,default:""},
        thumbnail:{type:String,default:""}
        },
    messageType: {
        type: Number,default: Config.APP_CONSTANTS.DATABASE.MSG_TYPE.TEXT, enum: [
            Config.APP_CONSTANTS.DATABASE.MSG_TYPE.TEXT,
            Config.APP_CONSTANTS.DATABASE.MSG_TYPE.IMAGE,
        ]
    },
    sentAt: {type: Number, default: 0, required: true},
});


let Chats = new Schema({
    user1:{type: Schema.ObjectId, ref: 'Users',index:true},
    user2: {type: Schema.ObjectId, ref: 'Users',index:true},
    chatCreateTime:{type:Number,default:0},
    combineId:{type:String,index:true},
    messages:[messages],
    blockByUser1:{type: Boolean,default:false},
    blockByUser2:{type: Boolean,default:false},
});

module.exports = mongoose.model('Chats', Chats);