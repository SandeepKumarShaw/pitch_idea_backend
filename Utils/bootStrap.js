
const mongoose = require('mongoose');
const Config = require('../Config');
const Modal = require('../Models');
mongoose.Promise = global.Promise;
let Service = require('../Services').queries;
let async = require('async');
const TokenManager = require('../Lib/TokenManager');
let SocketManager = require('../Lib/SocketManager');
const fs=require('fs');

mongoose.connect(Config.dbConfig.config.dbURI,{ useMongoClient: true }, function (err) {
    if (err) {
        console.log("DB Error: ", err);
        process.exit(1);
    } else {
        console.log('MongoDB Connected');
    }
});



exports.bootstrapAdmin = function (callback) {
    let adminData1 = {
        email: 'rohit@pitchidea.com',
        password: '897c8fde25c5cc5270cda61425eed3c8',   //qwerty
        name: 'PitchIdea',
        superAdmin:true
    };
    let adminData2 = {
        email: 'admin@pitchidea.com',
        password: '897c8fde25c5cc5270cda61425eed3c8',    //qwerty
        name: 'PitchIdea',
        superAdmin:true
    };
    let adminData3 = {
        email: 'test@pitchidea.com',
        password: '897c8fde25c5cc5270cda61425eed3c8',    //qwerty
        name: 'PitchIdea',
        superAdmin:true
    };
    async.parallel([
        function (cb) {
            insertData(adminData1.email, adminData1, cb)
        },
        function (cb) {
            insertData(adminData2.email, adminData2, cb)
        },
        function (cb) {
            insertData(adminData3.email, adminData3, cb)
        },
    ], function (err, done) {
        callback(err, 'Bootstrapping finished');
    })
};

exports.bootstrapAppVersion = function (callback) {
    let appVersion1 = {
        latestIOSVersion: '100',
        criticalIOSVersion: '100',
        latestAndroidVersion: '100',
        criticalAndroidVersion: '100',
        appType: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
    };

    async.parallel([
        function (cb) {
            insertVersionData(appVersion1.appType, appVersion1, cb)
        },
    ], function (err, done) {
        callback(err, 'Bootstrapping finished For App Version');
    })
};

function insertVersionData(appType, versionData, callback) {
    let needToCreate = true;
    async.series([
        function (cb) {
            let criteria = {
                appType: appType
            };
            Service.getData(Modal.AppVersions,criteria, {_id:1}, {},(err, data)=> {
                if (data && data.length > 0) {
                    needToCreate = false;
                }
                cb()
            })
        }, function (cb) {
            if (needToCreate) {
                Service.saveData(Modal.AppVersions,versionData, function (err, data) {
                    cb(err, data)
                })
            } else {
                cb();
            }
        }], function (err, data) {
        console.log('Bootstrapping finished for ' + appType);
        callback(err, 'Bootstrapping finished For Admin Data')
    })
}

function insertData(email, adminData, callback) {
    let needToCreate = true;
    async.series([function (cb) {
        let criteria = {
           email: email
        };
        Service.getData(Modal.Admins,criteria, {_id:1}, {}, function (err, data) {
            if (data && data.length > 0) {
                needToCreate = false;
            }
            cb()
        })
    }, function (cb) {
        if (needToCreate) {
            Service.saveData(Modal.Admins,adminData, function (err, data) {
                cb(err, data)
            })
        } else {
            cb();
        }
    }], function (err, data) {
       // console.log('Bootstrapping finished for ' + email);
        callback(err, 'Bootstrapping finished')
    })
}

exports.connectSocket = SocketManager.connectSocket;