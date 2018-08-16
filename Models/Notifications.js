'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Config = require('../Config').APP_CONSTANTS.DATABASE;

let Notifications = new Schema({
    userId : {type : Schema.ObjectId , ref:'Users',index:true},
    ideaId : {type:Schema.ObjectId,ref : 'Ideas',index:true},
    byUser : {type : Schema.ObjectId , ref:'Users',index:true},
    text : {type : String,default : ''},
    type : {type : Number, enum : [
        Config.TYPE.LOVEIT,
        Config.TYPE.PASSIT,
        Config.TYPE.SHARE,
        Config.TYPE.FAVOURITEIDEA,
        Config.TYPE.FAVOURITEPEOPLE,
    ]},
    createdOn : {type : Date,default : Date.now()},
    isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Notifications', Notifications);