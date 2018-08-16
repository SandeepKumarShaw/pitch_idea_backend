'use strict';

let Config = require('../Config');
let Jwt = require('jsonwebtoken');
let async = require('async');
let Modal = require('../Models');
let Service = require('../Services').queries;


let getTokenFromDB = function (userId, userType,flag,token, callback) {
    let userData = null;
    let criteria = {
        _id: userId,
        accessToken :token

    };
    async.series([
        function (cb) {
            if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER && flag==='USER'){
                Service.getData(Modal.Users,criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });

            }
            else if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN  && flag==='ADMIN'){
                Service.getData(Modal.Admins,criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });
            }else if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.SUPPLIER  && flag==='SUPPLIER'){
                Service.getData(Modal.Suppliers,criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });
            }else if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.DRIVER  && flag==='DRIVER'){
                Service.getData(Modal.Drivers,criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });
            }

            else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            if (userData && userData._id){
                userData.id = userData._id;
                userData.type = userType;
            }
            callback(null,{userData: userData})
        }
    });
};

let setTokenInDB = function (userId,userType, tokenToSave, callback) {
    let criteria = {
        _id: userId
    };
    let setQuery = {
        accessToken : tokenToSave
    };
    let dataToSend;
    async.series([
        function (cb) {
            if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER){
                Service.findAndUpdate(Modal.Users,criteria,setQuery,{new:true,lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            dataToSend=dataAry;
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }
                    }
                });

            }
            else if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN){
                Service.findAndUpdate(Modal.Admins,criteria,setQuery,{new:true,lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            dataToSend=dataAry;
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }}
                });
            } else if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.DRIVER){
                Service.findAndUpdate(Modal.Drivers,criteria,setQuery,{new:true,lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            dataToSend=dataAry;
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }}
                });
            } else if (userType === Config.APP_CONSTANTS.DATABASE.USER_TYPE.SUPPLIER){
                Service.findAndUpdate(Modal.Suppliers,criteria,setQuery,{new:true,lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            dataToSend=dataAry;
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }}
                });
            }
            else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            callback(null,dataToSend)
        }
    });
};

let verifyToken = function (token,flag, callback) {

    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            callback(err)
        } else {
            getTokenFromDB(decoded._id, decoded.type,flag,token, callback);
        }
    });
};

let setToken = function (tokenData, callback) {
    if (!tokenData._id && !tokenData.type) {
        callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        let tokenToSend = Jwt.sign(tokenData, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
        setTokenInDB(tokenData._id,tokenData.type, tokenToSend, function (err, data) {
            callback(null,data)
        })
    }
};

let decodeToken = function (token, callback) {
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decodedData) {
        if (err) {
            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            callback(null, decodedData)
        }
    })
};

module.exports = {
    setToken: setToken,
    verifyToken: verifyToken,
    decodeToken: decodeToken
};