
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Config = require('../Config').APP_CONSTANTS.DATABASE;
let SchemaTypes = mongoose.Schema.Types;

let Stats = new Schema({

    ideaId: {type: Schema.ObjectId,ref :'Ideas',index:true},
    userId: {type: Schema.ObjectId,ref :'Users',index:true},
    favouriteUser : {type: Schema.ObjectId,ref :'Users',default : null,sparse:true},
    loveIt: {type: Schema.ObjectId,ref :'LoveIt',default : null,sparse:true},
    passIt: {type: Schema.ObjectId,ref :'PassIt',sparse:true,default : null},
    type : {type : Number, enum : [
        Config.TYPE.LOVEIT,
        Config.TYPE.PASSIT,
        Config.TYPE.SHARE,
        Config.TYPE.FAVOURITEIDEA,
        Config.TYPE.FAVOURITEPEOPLE,
    ]},
    shareOn : {type : Number, enum : [
        Config.SHARE_ON.FACEBOOK,
        Config.SHARE_ON.TWITTER,
        Config.SHARE_ON.TEXT_EMAIL,
        Config.SHARE_ON.OTHERS,
    ]},
    month : {type:Number},
    year : {type:Number},
    createdOn : {type : Date,default: Date.now()},
    isDeleted : {type : Boolean ,default: false}
});

module.exports = mongoose.model('Stats', Stats);




