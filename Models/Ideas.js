
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config').APP_CONSTANTS.DATABASE;
let SchemaTypes = mongoose.Schema.Types;

let Ideas = new Schema({

    userId : {type: Schema.ObjectId,ref :'Users',index:true},
    ideaTitle: {type: String, trim: true,index:true},
    description: {type: String,default : ''},
    tags: {type: [String],default:''},
    stageId: {type: Schema.ObjectId,ref :'Stage',index:true},
    lookingFor: [{type:Schema.ObjectId,ref :'LookingFor',index:true}],
    imageUrl:[{
        original:{type:String,default:""},
        thumbnail:{type:String,default:""},
    }],
    status:{type : Number, default : Config.STATUS_TYPES.ACTIVE, enum : [
        Config.STATUS_TYPES.ARCHIVED,
        Config.STATUS_TYPES.DELETED,
        Config.STATUS_TYPES.ACTIVE,
    ]},

    showDetails : {type:Boolean,default:true},
    problem: {type: String,default:''},
    uniqueSolution:{type:String,default:''},
    targetCustomer:{type:String,default:''},
    businessModel:{type:String,default:''},
    mileStones:{type: String,default:''},

    showTeam : {type:Boolean,default:true},
    foundingMembers:[{type: Schema.ObjectId,ref:'Users'}],
    advisors:[{type: Schema.ObjectId,ref:'Users'}],
    investors:[{type: Schema.ObjectId,ref:'Users'}],

    showLinks : {type:Boolean,default:true},
    websiteUrl: {type: String,default:''},
    facebookUrl: {type: String,default:''},
    linkedinUrl: {type: String,default:''},

    favouriteCount : {type:Number,default : 0},
    loveItCount : {type:Number,default : 0},
    passItCount : {type:Number,default : 0},
    shareCount : {type:Number,default : 0},

    isBlocked:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false},
    address:{type: String,default:''},
    location: {type: [Number], index: '2dsphere'},
    createdOn: {type: Number, default:0},


});

Ideas.index({'location.coordinates': "2dsphere"});

module.exports = mongoose.model('Ideas', Ideas);




