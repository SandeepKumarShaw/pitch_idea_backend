
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config')


let ReportIdeas = {
    ideaId:{type:Schema.ObjectId,ref:"Ideas",required:true,index:true},
    reportBy:{type:Schema.ObjectId,ref:"Users",required:true},
    description:{type:String,default:""},
    reportDate: {type : Date, default:Date.now()},
    isDelete:{type:Boolean,default:false}
};

module.exports = mongoose.model('ReportIdeas', ReportIdeas);