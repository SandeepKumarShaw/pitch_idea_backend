
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config').APP_CONSTANTS.DATABASE;
let SchemaTypes = mongoose.Schema.Types;

let Accelerators = new Schema({

    userId : {type: Schema.ObjectId,ref :'Users',index:true},
    acceleratorName: {type: String, trim: true,index:true},
    description: {type: String,default : ''},
    industryFocus: {type: String,default : ''},
    requirements: {type: String,default : ''},
    acceleratorLength: [{type:Schema.ObjectId,ref :'IndustryLength',index:true}],
    showDetails : {type:Boolean,default:true},
    showTeam : {type:Boolean,default:true},
    showLinks : {type:Boolean,default:true},
    investmentInfo:{type: String,default : ''},
    seasons:{type: [String]},
    partners: [{type:Schema.ObjectId,ref :'Users'}],
    portfolio: [{type:Schema.ObjectId,ref :'Ideas'}],
    imageUrl:[{
        original:{type:String,default:""},
        thumbnail:{type:String,default:""},
    }],
    status:{type : Number, default : Config.STATUS_TYPES.ACTIVE, enum : [
        Config.STATUS_TYPES.ARCHIVED,
        Config.STATUS_TYPES.DELETED,
        Config.STATUS_TYPES.ACTIVE,
    ]},

    websiteUrl: {type: String,default:''},
    facebookUrl: {type: String,default:''},
    linkedinUrl: {type: String,default:''},
    twitterUrl: {type: String,default:''},
       
    isBlocked:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false},
    address:{type: [String]},
    location: {type: [Number], index: '2dsphere'},
    createdOn: {type: Number, default:0},


});

Accelerators.index({'location.coordinates': "2dsphere"});

module.exports = mongoose.model('Accelerators', Accelerators);




