
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config').APP_CONSTANTS.DATABASE;
let SchemaTypes = mongoose.Schema.Types;

let InvestmentFirms = new Schema({

    userId : {type: Schema.ObjectId,ref :'Users',index:true},
    investmentFirmName: {type: String, trim: true,index:true},
    description: {type: String,default : ''},
    investmentFocus: {type: [String]},
    requirements: {type: String,default : ''},
    invStageId: [{type:Schema.ObjectId,ref :'InvestmentStage',index:true}],
    investmentSize: [{type:Schema.ObjectId,ref :'InvestmentSize',index:true}],
    partners: [{type:Schema.ObjectId,ref :'Users'}],
    portfolio: [{type:Schema.ObjectId,ref :'Ideas'}],
    imageUrl:[{
        original:{type:String,default:""},
        thumbnail:{type:String,default:""},
    }],
    showDetails : {type:Boolean,default:true},
    showTeam : {type:Boolean,default:true},
    showLinks : {type:Boolean,default:true},
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

InvestmentFirms.index({'location.coordinates': "2dsphere"});

module.exports = mongoose.model('InvestmentFirms', InvestmentFirms);




