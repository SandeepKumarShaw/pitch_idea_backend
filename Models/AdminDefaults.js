
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config');


let AdminDefaults = new Schema({
    drawerImage:{
        original:{type:String,default:""},
        thumbnail:{type:String,default:""},
    },
    termsAndCondition:{type:String,default:""},
    privacyPolicy:{type:String,default:""},
    importantInfo:{type:String,default:""},
    helpAndSupport:{type:String,default:""},
});

module.exports = mongoose.model('AdminDefaults', AdminDefaults);




