
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let InvestmentStage = new Schema({

    name : {type :String,required : true},
    createdOn : {type : Number,default: 0},
    isDeleted : {type : Boolean ,default: false},
    isBlocked : {type : Boolean ,default: false},
});

module.exports = mongoose.model('InvestmentStage', InvestmentStage);
