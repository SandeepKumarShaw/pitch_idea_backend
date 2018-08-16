
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let LoveIt = new Schema({

    name : {type :String,required : true},
    createdOn : {type : Number,default: 0},
    isBlocked : {type : Boolean ,default: false},
    isDeleted : {type : Boolean ,default: false}
});

module.exports = mongoose.model('LoveIt', LoveIt);
