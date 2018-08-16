
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Config = require('../Config');
let SchemaTypes = mongoose.Schema.Types;

let Users = new Schema({

    fullName: {type: String,required:true, trim: true,index:true},
    description: {type: String,default : ''},
    password: {type: String,default:''},
    googleId: {type: String,default:"",sparse :true},
    facebookId: {type: String,default:"",sparse :true},
    linkedinId: {type: String,default:"",sparse :true},
    email: {type: String,default:'',sparse :true},
    websiteUrl: {type: String,default:''},
    facebookUrl: {type: String,default:''},
    linkedinUrl: {type: String,default:''},
    imageUrl:{
        original:{type:String,default:""},
        thumbnail:{type:String,default:""},
    },
    favouritePeopleCount : {type :Number,default : 0},
    favouriteIdeaCount : {type :Number,default : 0},
    ideasCount : {type :Number,default : 0},
    vcCount : {type :Number,default : 0},
    acceleratorCount : {type :Number,default : 0},
    interests:{type: [String]},
    lookingFor:[{type:Schema.ObjectId,ref : 'LookingFor'}],
    // currentLocation:{type: String,default:''},
    currentLocation:{type: Schema.ObjectId,ref :'Cities',index:true},
    bestWayToMeet:{type: [String]},
    ideas:{type: String,default:''},
    location:{type: String,default:''},
    registrationDate: {type: Number, default:0},
    showIdea:{type:Boolean,default:true},
    shareLocation:{type:Boolean,default:true},
    notifications:{type:Boolean,default:true},
    emailNotifications:{type:Boolean,default:false},
    isBlocked:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false},
    deviceToken:{type:String,trim:true,default:''},
    locationAddress: {type: [Number], index: '2dsphere'},
    socketId : {type:String,default : ''},
    accessToken:{type:String,trim:true},
});

Users.index({'location.coordinates': "2dsphere"});

module.exports = mongoose.model('Users', Users);




