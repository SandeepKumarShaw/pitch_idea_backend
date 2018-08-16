
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Cities = new Schema({

    country : {type: String, trim: true,index:true},
    name : {type: String, trim: true,index:true},
    lat : {type: String, trim: true,index:true},
    lng : {type: String, trim: true,index:true},
    
});

module.exports = mongoose.model('Cities', Cities);

