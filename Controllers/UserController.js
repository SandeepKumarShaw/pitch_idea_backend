"use strict";

const Service = require('../Services').queries;
const UniversalFunctions = require('../Utils/UniversalFunction');
const async = require('async');
const Config = require('../Config');
const Modal = require('../Models');
const TokenManager = require('../Lib/TokenManager');
const pushNotification = require('../Lib/pushNotification');
const UploadMultipart = require('../Lib/UploadMultipart');
const _ = require('lodash');
let mongoose = require('mongoose');
const UploadManager = require('../Lib/UploadManager');
const sendEmail = require('../Lib/email');
const moment = require('moment');



async function userDelete(payloadData,userData) {

    return new Promise((resolve, reject) => {
        /*let criteria = {
            email: payloadData.email
        };
        let dataToSet = {
            deviceToken: payloadData.deviceToken
        };
        let options = {
            lean: true,
            new: true
        };*/
        Service.remove(Modal.Users,{_id:payloadData.userId}, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data)
            }
        });
    })


}

async function userSignUp(payloadData) {
    let check1;
    if (payloadData.email) {
        check1 = await checkUser(payloadData)
    }
    let register = await registerUser(payloadData);
    let data = await tokenUpdate(register);
    return data
}

function checkUser(data) {

    return new Promise((resolve, reject) => {

        let query = {
            email: data.email,
            isDeleted: false
        };
        let projection = {
            _id: 1
        };
        Service.getData(Modal.Users, query, projection, {lean: true}, (err, result) => {
            if (err) {
                reject(err)
            }
            else {
                if (result.length) {
                    reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.ALREADY_EXIST)
                }
                else resolve()
            }

        })

    });
}

function registerUser(payloadData) {
    return new Promise((resolve, reject) => {

        let query = {
            fullName: payloadData.fullName,
            email: payloadData.email,
            locationAddress: [payloadData.long, payloadData.lat],
            registrationDate: +new Date()
        };

        if (payloadData.password) query.password = UniversalFunctions.CryptData(payloadData.password);
        if(payloadData.from ===3) query.googleId = payloadData.socialId;
        if(payloadData.from ===1) query.facebookId = payloadData.socialId;
        if(payloadData.from ===2) query.linkedinId = payloadData.socialId;
        if (payloadData.deviceToken) query.deviceToken = payloadData.deviceToken;
        if(payloadData.imageUrl) query.imageUrl = {
            original:payloadData.imageUrl,
            thumbnail:payloadData.imageUrl
        }
        Service.saveData(Modal.Users, query, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result)
            }
        })
    });
}

function  tokenUpdate(data) {
    let tokenData = {
        _id: data._id,
        type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
    };
    return new Promise((resolve, reject) => {
        TokenManager.setToken(tokenData, function (err, output) {
            if (err) {
                reject(err);
            } else {
                Modal.LookingFor.populate(output, [{
                    path: 'lookingFor',
                    select: 'name',
                    model: 'LookingFor'
                }],(err,result)=>{
                    resolve(result)
                });

            }
        });
    });
}

async function login(payloadData) {

    let f1 = await verifyUser(payloadData);
    let f2 = await tokenUpdate(f1);
    let f3 = updateUserToken(payloadData);
    return f2
}

function updateUserToken(payloadData) {

    return new Promise((resolve, reject) => {
        let criteria = {
            email: payloadData.email
        };
        let dataToSet = {
            deviceToken: payloadData.deviceToken
        };
        let options = {
            lean: true,
            new: true
        };
        Service.findAndUpdate(Modal.Users, criteria, dataToSet, options, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data)
            }
        });
    })

}

function updateUser(f1, payloadData) {
    if (f1.userExist === false) {
        return new Promise((resolve, reject) => {
            resolve(f1)
        })
    }
    else {
        let criteria = {};
        return new Promise((resolve, reject) => {

            criteria.email = payloadData.email;
            let dataToSet = {
                deviceToken: payloadData.deviceToken
            };
            if(payloadData.from ===3) dataToSet.googleId = payloadData.socialId;
            if(payloadData.from ===1) dataToSet.facebookId = payloadData.socialId;
            if(payloadData.from ===2) dataToSet.linkedinId = payloadData.socialId;
            let options = {
                lean: true,
                new: true
            };
            Service.findAndUpdate(Modal.Users, criteria, dataToSet, options, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    data.userExist = true;
                    resolve(data)
                }
            });
        })
    }

}

function verifyUser(payloadData) {

    return new Promise((resolve, reject) => {

        let getCriteria = {
            email: payloadData.email,
        };
        let project = {
            deviceToken: 0
        };
        Service.getData(Modal.Users, getCriteria, project, {lean: true},(err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result && result.length) {
                    if (result[0].password !== UniversalFunctions.CryptData(payloadData.password))
                        reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD);
                    else if (result[0].isBlocked)
                        reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED);
                    else {
                        result[0].type = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_TYPE.USER;
                        resolve(result[0])
                    }
                } else {
                    reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
                }
            }
        });
    });
}

async function logout(userData) {

    return new Promise((resolve, reject) => {
        let update = {
            accessToken: '',
            deviceToken: ''
        };
        Service.findAndUpdate(Modal.Users, {_id: userData._id}, update, {}, (err, result) => {
            if (err) {
                reject(err)
            }
            else resolve()
        })
    })
}

function checkUserSocial(data) {
    let query = {};
    return new Promise((resolve, reject) => {

        query.email = data.email;
        Service.getData(Modal.Users, query, {}, {lean: true}, (err, result) => {
            if (err) reject(err);
            else {
                if (result.length) {
                    if(result[0].isBlocked)
                        reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED);
                    else
                    resolve(result[0])
                }
                else resolve({userExist: false})
            }
        })
    })
}

async function socialLogin(payloadData) {

    let check = await checkUserSocial(payloadData);
    let update = await updateUser(check, payloadData);
    if(update.userExist)
        return await tokenUpdate(update);
    else return update
}

function getRequired(collection, criteria, project, option) {

    return new Promise((resolve, reject) => {
        Service.getData(collection, criteria, project, option, (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result.length)
                    resolve(result);
                else resolve([])
            }
        });
    });
}

function aggregate(collection, pipline) {

    return new Promise((resolve, reject) => {
        Service.aggregateData(collection, pipline, (err, result) => {
            resolve(result)
        })
    });
}

function getRequiredPopulate(collection, criteria, project, option, populate) {

    return new Promise((resolve, reject) => {
        Service.populateData(collection, criteria, project, option, populate, (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result.length)
                    resolve(result);
                else resolve([])
            }
        });
    });
}

async function getData(payloadData) {

    let criteria = {
            isBlocked: false,
            isDeleted: false
        }, projection = {
            isBlocked: 0,
            isDeleted: 0
        },
        option = {
            lean: true,
        };

    switch (payloadData.flag) {
        case 1: {
            option.sort = {_id: 1};
            return await getRequired(Modal.Stage, criteria, projection, option)
        }
        case 2 : {
            option.sort = {name:1};
            return await getRequired(Modal.LookingFor, criteria, projection, option)
        }
        case 3 : {
            option.sort = {_id: 1};
            return await getRequired(Modal.LoveIt, criteria, projection, option)
        }
        case 4: {
            option.sort = {_id: 1};
            return await getRequired(Modal.PassIt, criteria, projection, option)
        }
        case 5: {
            option.sort = {_id: 1};
            return await getRequired(Modal.InvestmentStage, criteria, projection, option)
        }
        case 6: {
            option.sort = {_id: 1};
            return await getRequired(Modal.InvestmentSize, criteria, projection, option)
        }
        case 7: {
            option.sort = {_id: 1};
            return await getRequired(Modal.IndustryLength, criteria, projection, option)
        }
    }
}

function saveData(collection, dataToSave) {
    return new Promise((resolve, reject) => {
        Service.saveData(collection, dataToSave, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        });
    });
}

function updateData(collection, criteria, dataToUpdate, option) {

    return new Promise((resolve, reject) => {
        Service.findAndUpdate(collection, criteria, dataToUpdate, option, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result)
            }
        });
    });
}

function multiUpdateData(collection, criteria, dataToUpdate, option) {

    return new Promise((resolve, reject) => {
        Service.update(collection, criteria, dataToUpdate, option, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result)
            }
        });
    });
}

function uploadImage(image) {
    if(Array.isArray(image)){
        return new Promise((resolve, reject) => {
            let imageData=[],len= image.length,count = 0;
            image.map((obj)=>{
                UploadMultipart.uploadFilesOnS3(obj,(err,result)=>{
                    count++;
                    imageData.push(result);
                    if(count === len)
                        resolve(imageData)
                })
            })
        });
    }
    else {
        return new Promise((resolve, reject) => {
            UploadMultipart.uploadFilesOnS3(image,(err,result)=>{
                resolve(result)
            })
        });
    }
}

async function updateProfile(payloadData, userData) {
    let criteria = {
        _id: userData._id
    };
    let dataToUpdate = {};

    if (payloadData.imageUrl) dataToUpdate.imageUrl = await uploadImage(payloadData.imageUrl);

    dataToUpdate.notifications = payloadData.notifications === 1;
    dataToUpdate.emailNotifications = payloadData.emailNotifications === 1;
    dataToUpdate.shareLocation = payloadData.shareLocation === 1;
    dataToUpdate.showIdea = payloadData.showIdea === 1;

    dataToUpdate.websiteUrl = payloadData.websiteUrl;
    dataToUpdate.facebookUrl = payloadData.facebookUrl;
    dataToUpdate.linkedinUrl = payloadData.linkedinUrl;
    if (payloadData.location) dataToUpdate.location = payloadData.location;
    if (payloadData.fullName) dataToUpdate.fullName = payloadData.fullName;
    if (payloadData.description) dataToUpdate.description = payloadData.description;

    dataToUpdate.interests = JSON.parse(payloadData.interests);
    dataToUpdate.lookingFor = JSON.parse(payloadData.lookingFor);
    dataToUpdate.bestWayToMeet = JSON.parse(payloadData.bestWayToMeet);
    if (payloadData.currentLocation) dataToUpdate.currentLocation = payloadData.currentLocation;

    let update = await updateData(Modal.Users, criteria, dataToUpdate, {new: true});

    return await Modal.LookingFor.populate(update, [{
        path: 'lookingFor',
        select: 'name',
        model: 'LookingFor'
    }]);

}

async function changePassword(payloadData, userData) {

    let modal;
    return new Promise((resolve, reject) => {

        if (payloadData.oldPassword === payloadData.newPassword) {
            reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORD)
        }
        else {
            let criteria = {
                _id: userData._id,
                password: UniversalFunctions.CryptData(payloadData.oldPassword)
            };
            let setQuery = {
                password: UniversalFunctions.CryptData(payloadData.newPassword)
            };
            let option = {
                new: true
            };
            userData.type==='ADMIN' ? modal = Modal.Admins : modal =Modal.Users;
            Service.findAndUpdate(modal, criteria, setQuery, option, function (err, result) {
                if (err) {
                    reject(err)
                } else {
                    if (result) resolve();
                    else reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_OLD_PASSWORD)
                }
            })
        }
    })
}

async function forgotPassword(payloadData) {

    return new Promise((resolve, reject) => {
        let criteria = {
            email: payloadData.email,
        };
        let option = {
            lean: true
        };
        Service.getData(Modal.Users, criteria, {}, option, function (err, result) {
            if (err) {
                reject(err)
            } else {
                if (result.length) {
                    if (result[0].isBlocked === true)
                        reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED);
                    else {

                        let string = UniversalFunctions.generateRandomString();
                        let password = UniversalFunctions.CryptData(string);
                        let dataToSave = {
                            password: password
                        };
                        Service.findAndUpdate(Modal.Users, {_id: result[0]._id}, dataToSave, {}, (err) => {
                            resolve()
                        });
                        sendMail(result[0], string)
                    }
                }
                else reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL)
            }
        })
    });
}

function sendMail(userData, password) {
    let strVar = "";
    strVar += "<!DOCTYPE html>";
    strVar += "    <html>";
    strVar += "    <head>";
    strVar += "    <title><\/title>";
    strVar += "    <\/head>";
    strVar += "    <body>";
    strVar += "    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse:collapse\">";
    strVar += "    <tbody>";
    strVar += "    <tr>";
    strVar += "    <td align=\"center\" valign=\"top\" style=\"background:#ffffff none no-repeat center\/cover;background-color:#ffffff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:27px;padding-bottom:63px\">";
    strVar += "    <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse:collapse;max-width:600px!important\">";
    strVar += "    <tbody>";
    strVar += "    <tr>";
    strVar += "    <td valign=\"top\" style=\"background:transparent none no-repeat center\/cover;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0;width:65%\">";
    strVar += "    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"min-width:100%;border-collapse:collapse\">";
    strVar += "    <tbody>";
    strVar += "    <tr>";
    strVar += "    <td valign=\"top\" style=\"padding-top:9px\">";
    strVar += "    <table align=\"left\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:100%;min-width:100%;border-collapse:collapse\" width=\"100%\">";
    strVar += "    <tbody>";
    strVar += "    <tr>";
    strVar += "    <td valign=\"top\" style=\"padding-top:0;padding-right:18px;padding-bottom:9px;padding-left:18px;word-break:break-word;color:#808080;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left\">";
    strVar += "    <p style=\"font-size: 35px;";
    strVar += "    color: black; line-height: 35px;\">Hello "+userData.fullName+"<\/p>";
    strVar += "<p style=\"font-size:16px!important;margin:10px 0;padding:0;color:#808080;font-family:Helvetica;line-height:150%;text-align:left\"><\/p>";
    strVar += " <p style=\"font-size:16px!important;margin:10px 0;padding:0;color:#808080;font-family:Helvetica;line-height:150%;text-align:left\">Your temporary password for the Launchise app is - " + password + ".<\/p>";
    strVar += "                ";
    strVar += "<p style=\"font-size:16px!important;margin:10px 0;padding:0;color:#808080;font-family:Helvetica;line-height:150%;text-align:left\">Please use this for login.ThankYou<\/p>";
    strVar += "<\/td>";
    strVar += "<\/tr>";
    strVar += "<\/tbody>";
    strVar += "<\/table>";
    strVar += "<\/td>";
    strVar += "<\/tr>";
    strVar += "<\/tbody>";
    strVar += "<\/table>";
    strVar += "";
    strVar += "<span class=\"HOEnZb\">";
    strVar += "    <font color=\"#888888\"><\/font>";
    strVar += "    <\/span>";
    strVar += "    <\/td>";
    strVar += "    <\/tr>";
    strVar += "    <\/tbody>";
    strVar += "    <\/table>";
    strVar += "    <\/body>";
    strVar += "    <\/html>";
    strVar += "";
    strVar += "   ";

    sendEmail.sendEmail(userData.email, 'Password Reset', strVar)
}

async function addEditIdea(payloadData, userData) {
    let image ;
    let criteria = {
        _id: payloadData.ideaId
    };
    let dataToUpdate = {};
    if(payloadData.imageUrl) image = await uploadImage(payloadData.imageUrl);

    if(payloadData.imageUrl) {
        if(Array.isArray(payloadData.imageUrl)) dataToUpdate.imageUrl = image;
        else dataToUpdate.imageUrl = [image];
    };

    if (payloadData.ideaTitle) dataToUpdate.ideaTitle = payloadData.ideaTitle;
    if (payloadData.description) dataToUpdate.description = payloadData.description;
    if (payloadData.tags) dataToUpdate.tags = payloadData.tags;
    if (payloadData.stageId) dataToUpdate.stageId = payloadData.stageId;
    if (payloadData.lookingFor) dataToUpdate.lookingFor = JSON.parse(payloadData.lookingFor);

    dataToUpdate.problem = payloadData.problem;
    dataToUpdate.uniqueSolution = payloadData.uniqueSolution;
    dataToUpdate.targetCustomer = payloadData.targetCustomer;
    dataToUpdate.businessModel = payloadData.businessModel;
    dataToUpdate.mileStones = payloadData.mileStones;

    dataToUpdate.foundingMembers = JSON.parse(payloadData.foundingMembers);
    dataToUpdate.advisors = JSON.parse(payloadData.advisors);
    dataToUpdate.investors = JSON.parse(payloadData.investors);

    dataToUpdate.websiteUrl = payloadData.websiteUrl;
    dataToUpdate.facebookUrl = payloadData.facebookUrl;
    dataToUpdate.linkedinUrl = payloadData.linkedinUrl;

    dataToUpdate.address = payloadData.address;
    dataToUpdate.location = [parseFloat(payloadData.long),parseFloat(payloadData.lat)];

    dataToUpdate.showDetails = payloadData.showDetails === 1;
    dataToUpdate.showTeam = payloadData.showTeam === 1;
    dataToUpdate.showLinks = payloadData.showLinks === 1;

    if (payloadData.ideaId) {
        let data = await updateData(Modal.Ideas, criteria, dataToUpdate, {new: true});
        return {}
    }
    else {
        dataToUpdate.userId = userData._id;
        dataToUpdate.createdOn = +new Date();

        let data = await saveData(Modal.Ideas, dataToUpdate);
        let updateCount = await updateData(Modal.Users,{_id:userData._id},{$inc :{ideasCount:1}}, {new: true});
        return {}
    }
}
async function addEditVCs(payloadData, userData) {
    let image ;
    let criteria = {
        _id: payloadData.VCId
    };
    let dataToUpdate = {};
    if(payloadData.imageUrl) image = await uploadImage(payloadData.imageUrl);

    if(payloadData.imageUrl) {
        if(Array.isArray(payloadData.imageUrl)) dataToUpdate.imageUrl = image;
        else dataToUpdate.imageUrl = [image];
    };

    if (payloadData.investmentFirmName) dataToUpdate.investmentFirmName = payloadData.investmentFirmName;
    if (payloadData.description) dataToUpdate.description = payloadData.description;
    if (payloadData.investmentFocus) dataToUpdate.investmentFocus = JSON.parse(payloadData.investmentFocus);
    if (payloadData.requirements) dataToUpdate.requirements = payloadData.requirements;
    if (payloadData.invStageId) dataToUpdate.invStageId = JSON.parse(payloadData.invStageId);
    if (payloadData.investmentSize) dataToUpdate.investmentSize = JSON.parse(payloadData.investmentSize);
    // console.log("SIZE",dataToUpdate);

    dataToUpdate.partners = JSON.parse(payloadData.partners);
    dataToUpdate.portfolio = JSON.parse(payloadData.portfolio);
    
    dataToUpdate.showDetails = payloadData.showDetails === 1;
    dataToUpdate.showTeam = payloadData.showTeam === 1;
    dataToUpdate.showLinks = payloadData.showLinks === 1;

    dataToUpdate.websiteUrl = payloadData.websiteUrl;
    dataToUpdate.facebookUrl = payloadData.facebookUrl;
    dataToUpdate.linkedinUrl = payloadData.linkedinUrl;
    dataToUpdate.twitterUrl = payloadData.twitterUrl;

    if (payloadData.address!==undefined){
        dataToUpdate.address = JSON.parse(payloadData.address);
    }
    dataToUpdate.location = [parseFloat(payloadData.long),parseFloat(payloadData.lat)];
    
    

    if (payloadData.VCId) {
        let data = await updateData(Modal.InvestmentFirms, criteria, dataToUpdate, {new: true});
        // console.log("updateData", data);
        return {}
    }
    else {
        dataToUpdate.userId = userData._id;
        dataToUpdate.createdOn = +new Date();
        // console.log('Data To Update : ',dataToUpdate);
        let data = await saveData(Modal.InvestmentFirms, dataToUpdate);
        let updateCount = await updateData(Modal.Users,{_id:userData._id},{$inc :{vcCount:1}}, {new: true});
        return {}
    }
}
async function addEditAccelerator(payloadData, userData) {
    let image ;
    let criteria = {
        _id: payloadData.acceleratorId
    };
    let dataToUpdate = {};
    if(payloadData.imageUrl) image = await uploadImage(payloadData.imageUrl);

    if(payloadData.imageUrl) {
        if(Array.isArray(payloadData.imageUrl)) dataToUpdate.imageUrl = image;
        else dataToUpdate.imageUrl = [image];
    };

    if (payloadData.acceleratorName) dataToUpdate.acceleratorName = payloadData.acceleratorName;
    if (payloadData.description) dataToUpdate.description = payloadData.description;
    if (payloadData.industryFocus) dataToUpdate.industryFocus = payloadData.industryFocus;
    if (payloadData.requirements) dataToUpdate.requirements = payloadData.requirements;
    if (payloadData.acceleratorLength) dataToUpdate.acceleratorLength = JSON.parse(payloadData.acceleratorLength);
    if (payloadData.investmentInfo) dataToUpdate.investmentInfo = payloadData.investmentInfo;
    if (payloadData.seasons) dataToUpdate.seasons = JSON.parse(payloadData.seasons);
    
    // console.log("SIZE",dataToUpdate);

    dataToUpdate.partners = JSON.parse(payloadData.partners);
    dataToUpdate.portfolio = JSON.parse(payloadData.portfolio);
    if (payloadData.address!==undefined){
        dataToUpdate.address = JSON.parse(payloadData.address);
    }
    dataToUpdate.location = [parseFloat(payloadData.long),parseFloat(payloadData.lat)];

    dataToUpdate.showDetails = payloadData.showDetails === 1;
    dataToUpdate.showTeam = payloadData.showTeam === 1;
    dataToUpdate.showLinks = payloadData.showLinks === 1;

    dataToUpdate.websiteUrl = payloadData.websiteUrl;
    dataToUpdate.facebookUrl = payloadData.facebookUrl;
    dataToUpdate.linkedinUrl = payloadData.linkedinUrl;
    dataToUpdate.twitterUrl = payloadData.twitterUrl;

    if (payloadData.acceleratorId) {
        let data = await updateData(Modal.Accelerators, criteria, dataToUpdate, {new: true});
        // console.log("updateData", data);
        return {}
    }
    else {
        dataToUpdate.userId = userData._id;
        dataToUpdate.createdOn = +new Date();
        // console.log('Data To Update : ',dataToUpdate);
        let data = await saveData(Modal.Accelerators, dataToUpdate);
        let updateCount = await updateData(Modal.Users,{_id:userData._id},{$inc :{acceleratorCount:1}}, {new: true});
        return {}
    }
}
async function exploreIdeas(payloadData, userData)  {

    let criteria = {
        isBlocked: false,
        isDeleted: false,
        status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };

    if (payloadData.stageId) criteria.stageId = payloadData.stageId;
    if (JSON.parse(payloadData.lookingFor).length) criteria.lookingFor = {$in: JSON.parse(payloadData.lookingFor)};
    // console.log('criteria 1: ',criteria);
    
    // console.log('criteria 2: ',criteria);
    if (payloadData.search){
        // criteria.ideaTitle = new RegExp(payloadData.search, 'i');
        let criteria_s={ $or: [ { ideaTitle: new RegExp(payloadData.search, 'i') }, { tags: new RegExp(payloadData.search, 'i') } ] }
        _.merge(criteria, criteria_s);
    } 

    if(payloadData.address) criteria.address = new RegExp(payloadData.address, 'i');
    if(payloadData.lat && payloadData.long){
        criteria = {
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [payloadData.long, payloadData.lat]
                    },
                    $maxDistance: 50000,
                }
            },
            isBlocked: false,
            isDeleted: false,
            status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
        }

        if (payloadData.stageId) criteria.stageId = payloadData.stageId;
        if (JSON.parse(payloadData.lookingFor).length) criteria.lookingFor = {$in: JSON.parse(payloadData.lookingFor)};
        
        
        // console.log('criteria 2: ',criteria);
        // if (payloadData.search) criteria.ideaTitle = new RegExp(payloadData.search, 'i');
        if (payloadData.search){
            // criteria.ideaTitle = new RegExp(payloadData.search, 'i');
            let criteria_s={ $or: [ { ideaTitle: new RegExp(payloadData.search, 'i') }, { tags: new RegExp(payloadData.search, 'i') } ] }
            _.merge(criteria, criteria_s);
        }
    }
    // console.log('criteria 3: ',criteria);
    let option = {
        lean : true,
        sort: {_id: -1},
       skip: (payloadData.pageNo - 1) * 20,
      limit: 20
    };
    let populate = [
        {
            path: "stageId",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "foundingMembers",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "advisors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "investors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.Ideas, criteria, {}, option, populate);

    let count = await getCount(Modal.Ideas, criteria);
    return {data: getData, count: count}

}

async function explorePeople(payloadData, userData)  {
    // console.log("user id:",userData._id);
    let criteria = {
        isBlocked: false,
        isDeleted: false,
        _id : {$ne: userData._id},
    };

    // console.log(payloadData.interests);
    // if (payloadData.stageId) criteria.stageId = payloadData.stageId;
    if (payloadData.lookingFor!==undefined){
        if (JSON.parse(payloadData.lookingFor).length) criteria.lookingFor = {$in: JSON.parse(payloadData.lookingFor)};
    }
        
    if (payloadData.interests!==undefined){
        if (JSON.parse(payloadData.interests).length) criteria.interests = {$in: JSON.parse(payloadData.interests)};
    }


    
    if (payloadData.search){
        // if (payloadData.search) criteria.fullName = new RegExp(payloadData.search, 'i');
        let criteria_s={ $or: [ { fullName: new RegExp(payloadData.search, 'i') }, { interests: new RegExp(payloadData.search, 'i') } ] }
        _.merge(criteria, criteria_s);
            
    }
    if (payloadData.location!=''){
        if (payloadData.location) criteria.location = new RegExp(payloadData.location, 'i');
    }

    if(payloadData.lat && payloadData.long){
        criteria = {
            locationAddress: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [payloadData.long, payloadData.lat]
                    },
                    $maxDistance: 50000,
                }
            },
            isBlocked: false,
            isDeleted: false,
            _id : {$ne: userData._id},
        }

        if (payloadData.lookingFor!==undefined){
            if (JSON.parse(payloadData.lookingFor).length) criteria.lookingFor = {$in: JSON.parse(payloadData.lookingFor)};
        }
            
        if (payloadData.interests!==undefined){
            if (JSON.parse(payloadData.interests).length) criteria.interests = {$in: JSON.parse(payloadData.interests)};
        }


        
        if (payloadData.search!=''){
            // if (payloadData.search) criteria.fullName = new RegExp(payloadData.search, 'i');
            let criteria_s={ $or: [ { fullName: new RegExp(payloadData.search, 'i') }, { interests: new RegExp(payloadData.search, 'i') } ] }
            _.merge(criteria, criteria_s);
        }
        if (payloadData.location!=''){
            if (payloadData.location) criteria.location = new RegExp(payloadData.location, 'i');
        }
    }
    console.log(criteria);
    let option = {
        lean : true,
        sort: {_id: -1},
       skip: (payloadData.pageNo - 1) * 20,
      limit: 20
    };
    let populate = [
            {
                path: 'User',
                match: {},
                select: 'fullName imageUrl bestWayToMeet interests lookingFor linkedinUrl facebookUrl showIdea websiteUrl email description location locationAddress',
                options: {},
                populate : [
                    {
                        path : "lookingFor",
                        select : "name",
                        match : {},
                        option : {lean: true}
                    }
                ]
            },
        ];
        let userPopulate = [
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.Users, criteria, {}, option,userPopulate);

    let count = await getCount(Modal.Users, criteria);
    return {data: getData, count: count}

}

async function exploreVCs(payloadData, userData)  {

    let criteria = {
        isBlocked: false,
        isDeleted: false,
        status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };

    if (payloadData.invStageId!==undefined){
        if (JSON.parse(payloadData.invStageId).length) criteria.invStageId = {$in: JSON.parse(payloadData.invStageId)};
    }
    if (payloadData.address!==undefined){
        if (JSON.parse(payloadData.address).length) criteria.address = {$in: JSON.parse(payloadData.address)};
    }
    if (payloadData.search){
       
        let criteria_s={ $or: [ { investmentFirmName: new RegExp(payloadData.search, 'i') }, { investmentFocus: new RegExp(payloadData.search, 'i') } ] }
        _.merge(criteria, criteria_s);
    } 
    if (payloadData.investmentSize!==undefined){
        if (JSON.parse(payloadData.investmentSize).length) criteria.investmentSize = {$in: JSON.parse(payloadData.investmentSize)};
    }
    if(payloadData.lat && payloadData.long){
        criteria = {
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [payloadData.long, payloadData.lat]
                    },
                    $maxDistance: 50000,
                }
            },
            isBlocked: false,
            isDeleted: false,
            status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
        }

        
        if (payloadData.invStageId!==undefined){
            if (JSON.parse(payloadData.invStageId).length) criteria.invStageId = {$in: JSON.parse(payloadData.invStageId)};
        }
       
        if (payloadData.search){
           
            let criteria_s={ $or: [ { investmentFirmName: new RegExp(payloadData.search, 'i') }, { investmentFocus: new RegExp(payloadData.search, 'i') } ] }
            _.merge(criteria, criteria_s);
        } 
        if (payloadData.investmentSize!==undefined){
            if (JSON.parse(payloadData.investmentSize).length) criteria.investmentSize = {$in: JSON.parse(payloadData.investmentSize)};
        }
    }
    console.log('criteria: ',criteria);
    let option = {
        lean : true,
        sort: {_id: -1},
       skip: (payloadData.pageNo - 1) * 20,
      limit: 20
    };
    let populate = [
        {
            path: "invStageId",
            select: "name",
            match: {},
            option: {lean: true}
        },{
            path: "investmentSize",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "partners",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "portfolio",
            select: "ideaTitle imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.InvestmentFirms, criteria, {}, option, populate);
    // console.log(getData);
    let count = await getCount(Modal.InvestmentFirms, criteria);
    return {data: getData, count: count}

}
async function exploreAccelerator(payloadData, userData)  {

    let criteria = {
        isBlocked: false,
        isDeleted: false,
        status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };

    if (payloadData.acceleratorLength!==undefined){
        if (JSON.parse(payloadData.acceleratorLength).length) criteria.acceleratorLength = {$in: JSON.parse(payloadData.acceleratorLength)};
    }
   
    if (payloadData.search){
       
        let criteria_s={ $or: [ { acceleratorName: new RegExp(payloadData.search, 'i') }, { industryFocus: new RegExp(payloadData.search, 'i') } ] }
        _.merge(criteria, criteria_s);
    } 
    if (payloadData.address!==undefined){
        if (JSON.parse(payloadData.address).length) criteria.address = {$in: JSON.parse(payloadData.address)};
    }
    if(payloadData.lat && payloadData.long){
        criteria = {
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [payloadData.long, payloadData.lat]
                    },
                    $maxDistance: 50000,
                }
            },
            isBlocked: false,
            isDeleted: false,
            status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
        }

        
        if (payloadData.acceleratorLength!==undefined){
            if (JSON.parse(payloadData.acceleratorLength).length) criteria.acceleratorLength = {$in: JSON.parse(payloadData.acceleratorLength)};
        }
       
        if (payloadData.search){
           
            let criteria_s={ $or: [ { acceleratorName: new RegExp(payloadData.search, 'i') }, { industryFocus: new RegExp(payloadData.search, 'i') } ] }
            _.merge(criteria, criteria_s);
        } 
    }
    console.log('criteria: ',criteria);
    let option = {
        lean : true,
        sort: {_id: -1},
       skip: (payloadData.pageNo - 1) * 20,
      limit: 20
    };
    let populate = [
        {
            path: "acceleratorLength",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "partners",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "portfolio",
            select: "ideaTitle imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.Accelerators, criteria, {}, option, populate);
    // console.log(getData);
    let count = await getCount(Modal.Accelerators, criteria);
    return {data: getData, count: count}

}
async function getPeopleDetails(payloadData,userData) {

    let populate = [
        
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.Users,{_id:payloadData.userId}, {},{lean:true}, populate);

    let user_arr='["'+payloadData.userId+'"]';
    
    let option = {
        lean : true
       
    };
    let populate_idea = [
        {
            path: "stageId",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "foundingMembers",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "advisors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "investors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let criteria_founder ={
        
        isBlocked: false,
        isDeleted: false,
        foundingMembers: {$in: JSON.parse(user_arr)},
        status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };
    let getfounder = await getRequiredPopulate(Modal.Ideas, criteria_founder, {}, option, populate_idea);
    getData[0].founder=getfounder;

    let criteria_investors ={
        
        isBlocked: false,
        isDeleted: false,
        investors: {$in: JSON.parse(user_arr)},
        status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };
    let getinvestors = await getRequiredPopulate(Modal.Ideas, criteria_investors, {}, option, populate_idea);
    getData[0].investors=getinvestors;

    let criteria_advisors ={
        
        isBlocked: false,
        isDeleted: false,
        advisors: {$in: JSON.parse(user_arr)},
        status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };
    let getadvisors = await getRequiredPopulate(Modal.Ideas, criteria_advisors, {}, option, populate_idea);
    getData[0].advisors=getadvisors;

    return {data:getData}
}
async function getVCDetails(payloadData,userData) {

    let populate = [
        
        {
            path: "invStageId",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "investmentSize",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "partners",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        },
        {
            path: "portfolio",
            select: "ideaTitle description tags stageId lookingFor imageUrl status",
            match: {},
            option: {lean: true},
            populate : [
                {
                    path : "stageId",
                    select : "name",
                    match : {},
                    option : {lean: true}
                },
                {
                    path : "lookingFor",
                    select : "name",
                    match : {},
                    option : {lean: true}
                }
            ]
        }

        

    ];
    console.log(payloadData.VCId);
    let getData = await getRequiredPopulate(Modal.InvestmentFirms,{_id:payloadData.VCId}, {},{lean:true}, populate);

    return {data:getData}
}
async function getAcceleratorDetails(payloadData,userData) {

    let populate = [
        
        {
            path: "acceleratorLength",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "partners",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        },
        {
            path: "portfolio",
            select: "ideaTitle description tags stageId lookingFor imageUrl status",
            match: {},
            option: {lean: true},
            populate : [
                {
                    path : "stageId",
                    select : "name",
                    match : {},
                    option : {lean: true}
                },
                {
                    path : "lookingFor",
                    select : "name",
                    match : {},
                    option : {lean: true}
                }
            ]
        }

        

    ];
    console.log(payloadData.acceleratorId);
    let getData = await getRequiredPopulate(Modal.Accelerators,{_id:payloadData.acceleratorId}, {},{lean:true}, populate);

    return {data:getData}
}
function getCount(collection, criteria) {
    return new Promise((resolve, reject) => {
        Service.count(collection, criteria, (err, result) => {
            resolve(result);
        });
    });
}

async function changeStatus(payloadData, userData) {

    let update = await updateData(Modal.Ideas,{_id:payloadData.ideaId},{status:payloadData.status},{});
    return {}
}

async function VCChangeStatus(payloadData, userData) {

    let update = await updateData(Modal.InvestmentFirms,{_id:payloadData.VCId},{status:payloadData.status},{});
    return {}
}

async function acceleratorChangeStatus(payloadData, userData) {

    let update = await updateData(Modal.Accelerators,{_id:payloadData.acceleratorId},{status:payloadData.status},{});
    return {}
}

async function getMyIdeas(payloadData, userData) {

    let criteria = {
        isBlocked: false,
        isDeleted: false,
        userId : userData._id,
        status : payloadData.status
    };

    let option = {
        lean: true,
        sort: {_id: -1},
        skip: (payloadData.pageNo - 1) * 20,
        limit: 20
    };
    let populate = [
        {
            path: "stageId",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "foundingMembers",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "advisors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "investors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.Ideas, criteria, {}, option, populate);

    let count = await getCount(Modal.Ideas, criteria);
    return {data: getData, count: count}

}
async function getMyVCs(payloadData, userData) {

    let criteria = {
        isBlocked: false,
        isDeleted: false,
        userId : userData._id,
        status : payloadData.status
    };

    let option = {
        lean: true,
        sort: {_id: -1},
        skip: (payloadData.pageNo - 1) * 20,
        limit: 20
    };
    let populate = [
        {
            path: "invStageId",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "investmentSize",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "partners",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "portfolio",
            select: "ideaTitle imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.InvestmentFirms, criteria, {}, option, populate);

    let count = await getCount(Modal.InvestmentFirms, criteria);
    return {data: getData, count: count}

}
async function getMyAcceletors(payloadData, userData) {

    let criteria = {
        isBlocked: false,
        isDeleted: false,
        userId : userData._id,
        status : payloadData.status
    };

    let option = {
        lean: true,
        sort: {_id: -1},
        skip: (payloadData.pageNo - 1) * 20,
        limit: 20
    };
    let populate = [
        
        {
            path: "acceleratorLength",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "partners",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "portfolio",
            select: "ideaTitle imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.Accelerators, criteria, {}, option, populate);

    let count = await getCount(Modal.Accelerators, criteria);
    return {data: getData, count: count}

}
async function searchUser(payloadData) {

    let criteria = {
        isBlocked : false,
        isDeleted: false
    };
    if(payloadData.name) criteria.fullName = new RegExp(payloadData.name,'i');
    let getResult = await getRequired(Modal.Users,criteria,{_id:1,fullName:1,email:1,imageUrl:1},{lean:true,sort:{fullName:1}});
    return getResult
}
async function searchLocation(payloadData) {

    let criteria = {
        // isBlocked : false,
    };
    if(payloadData.name) criteria.name = new RegExp(payloadData.name,'i');
    let getResult = await getRequired(Modal.Cities,criteria,{_id:1,name:1,country:1},{lean:true,sort:{name:1}});
    return getResult
}
async function searchIdea(payloadData) {

    let criteria = {
        isBlocked : false,
        isDeleted: false,
        status : Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };
    if(payloadData.title) criteria.ideaTitle = new RegExp(payloadData.title,'i');
    let getResult = await getRequired(Modal.Ideas,criteria,{_id:1,ideaTitle:1,imageUrl:1},{lean:true,sort:{ideaTitle:1}});
    return getResult
}

async function getIdeaPeople(payloadData,userData) {

    let criteria = {
        userId : userData._id,
        isDeleted: false
    };
    let option = {
        lean : true,
        sort : {_id:-1},
        skip : (payloadData.pageNo - 1) * 20,
        limit : 20
    };
    if(payloadData.flag ===1){

        criteria.type = Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEIDEA;
        let populate = [
            {
                path: 'ideaId',
                match: {},
                select: 'imageUrl ideaTitle description',
                options: {},
            },
        ];
        let getResult = await getRequiredPopulate(Modal.Stats,criteria,{},option,populate);
        return {data :getResult}
    }
    else {
        criteria.type = Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE;
        let populate = [
            {
                path: 'favouriteUser',
                match: {},
                select: 'fullName imageUrl bestWayToMeet interests lookingFor linkedinUrl facebookUrl showIdea websiteUrl email description location',
                options: {},
                populate : [
                    {
                        path : "lookingFor",
                        select : "name",
                        match : {},
                        option : {}
                    }
                ]
            },
        ];
        let getResult = await getRequiredPopulate(Modal.Stats,criteria,{},option,populate);
        if(getResult.length){
                for(let i=0;i<getResult.length;i++){
                    let c1={user1: userData._id,user2:getResult[i].favouriteUser._id};
                    let c2={user1:getResult[i].favouriteUser._id,user2: userData._id};

                    let result = await getRequired(Modal.Chats,{ $or: [c1,c2]},{_id:1},{});
                    if(result.length)
                        getResult[i].chatExist=result[0]._id;
                }
            return {data :getResult}
        }
        else return {data :getResult}
    }

}

async function favPeopleIdea(payloadData,userData) {

    let dataToSet = {},dataToUpdate={},pushData = {},saveNotify = {},
        peopleCriteria ={
            userId : userData._id,
            favouriteUser : payloadData.userId,
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE
    },ideaCriteria ={
            ideaId : payloadData.ideaId,
            userId : userData._id,
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEIDEA
        },
        criteria = {
        _id : userData._id,
    };
    let userDetail =  await getRequired(Modal.Users,{_id:payloadData.userId},{deviceToken:1},{lean:true});

    if(payloadData.flag && payloadData.type===1){

       dataToUpdate = {$inc:{favouriteCount:1}};
        dataToSet = {
            $inc : {favouriteIdeaCount:1}
        };

        let dataToSave1 = {
            userId : userData._id,
            ideaId : payloadData.ideaId,
            createdOn : new Date(),
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEIDEA,
            isDeleted : false
        };

        updateData(Modal.Stats,ideaCriteria,dataToSave1,{upsert:true});

        let notifyCriteria ={
            byUser : userData._id,
            userId : payloadData.userId,
            ideaId : payloadData.ideaId,
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEIDEA,
        };

         saveNotify = {
            byUser : userData._id,
            userId : payloadData.userId,
            ideaId : payloadData.ideaId,
            text : userData.fullName+' favorited "'+payloadData.ideaTitle+'"',
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEIDEA,
             isDeleted :false,
             createdOn: new Date()
        };

        await updateData(Modal.Notify,notifyCriteria,saveNotify,{upsert:true});

        pushData = {
            type:  Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEIDEA,
            msg:  userData.fullName+' favorited "'+payloadData.ideaTitle+'"',
            ideaId:  payloadData.ideaId,
            ideaTitle:payloadData.ideaTitle
        };

        pushNotification.sendPush(userDetail[0].deviceToken,pushData);
    }
    else if(payloadData.flag===false && payloadData.type===1){

        dataToUpdate = {$inc:{favouriteCount:-1}};
        dataToSet = {
            $inc : {favouriteIdeaCount:-1}
        };

        let dataToSave1 ={isDeleted:true};
       await updateData(Modal.Stats,ideaCriteria,dataToSave1,{});
    }
    else if(payloadData.flag && payloadData.type ===2){

        dataToSet = {
            $inc : {favouritePeopleCount: 1}
        };

        let dataToSave = {
            userId : userData._id,
            favouriteUser : payloadData.userId,
            createdOn : new Date(),
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE,
            isDeleted : false
        };
        updateData(Modal.Stats,peopleCriteria,dataToSave,{upsert:true});

        let notifyCriteria ={
            byUser : userData._id,
            userId : payloadData.userId,
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE,
        };

        saveNotify = {
            byUser : userData._id,
            userId : payloadData.userId,
            text : userData.fullName+' added you as favorite.',
            type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE,
            isDeleted: false,
            createdOn: new Date(),
        };

        await updateData(Modal.Notify,notifyCriteria,saveNotify,{upsert:true});

        pushData = {
            type:  Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE,
            msg:  userData.fullName+' added you as favorite.',
            userId:  payloadData.userId,
        };

        pushNotification.sendPush(userDetail[0].deviceToken,pushData);

    }
    else {

        dataToSet = {
            $inc : {favouritePeopleCount:-1}
        };

        let dataToSave ={isDeleted:true};
        updateData(Modal.Stats,peopleCriteria,dataToSave,{});
    }
    let updateUser = await updateData(Modal.Users,criteria,dataToSet,{new:true});
    await updateData(Modal.Ideas,{_id:payloadData.ideaId},dataToUpdate,{new:true});
    return updateUser
}

async function lovePassIdea(payloadData,userData) {

    let loveCriteria ={
            userId : userData._id,
            ideaId : payloadData.ideaId,
            loveIt : payloadData.lovePassId,
            type : Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT
        },
        passCriteria ={
            ideaId : payloadData.ideaId,
            userId : userData._id,
            passIt : payloadData.lovePassId,
            type : Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT
        },dataToSet ={},criteria ={_id:payloadData.ideaId};
    let saveNotify = {},pushData = {};

    let userDetail =  await getRequired(Modal.Users,{_id:payloadData.userId},{deviceToken:1},{lean:true});

    let check = {
        userId : userData._id,
        ideaId : payloadData.ideaId,
        type : {$in:[0,1]}
    };

    let checkData =  await getRequired(Modal.Stats,check,{},{lean:true});

    if(checkData.length){
        let notifyCriteria ={
            byUser : userData._id,
            ideaId : payloadData.ideaId,
            userId : payloadData.userId,
            type : {$in:[0,1]}
        };

        let notifyData = await getRequired(Modal.Notify,notifyCriteria,{},{lean:true});

        let data ={},flag=false;
                                                                    // Db     //userside
        if(checkData[0].type===0 && payloadData.type ===1){        //loveIt  loveIt
            data = {
                loveIt : payloadData.lovePassId
                 };

          if(!(JSON.stringify(checkData[0].loveIt) === JSON.stringify(payloadData.lovePassId))){
              flag=true;
              saveNotify ={
                    text : userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"'
                };
              pushData = {
                  type:  Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
                  msg: userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"',
                  ideaId:  payloadData.ideaId,
                  byUser : userData._id,
              }
          }
        }
        else if(checkData[0].type===0 && payloadData.type ===2){    //loveIt  passIt
            dataToSet ={$inc :{passItCount:1,loveItCount:-1}};
            data = {
                type : Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
                $unset : {loveIt:1},
                passIt : payloadData.lovePassId
            };
            flag=true;
            saveNotify ={
                type : Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
                text :userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"'
            };
            pushData = {
                type:  Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
                msg: userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"',
                ideaId:  payloadData.ideaId,
                byUser : userData._id,
            }
        }
        else if(checkData[0].type===1 && payloadData.type ===1){   //passIt   loveIt
            dataToSet ={$inc :{loveItCount:1,passItCount:-1}};
            data = {
                type : Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
                $unset : {passIt:1},
                loveIt : payloadData.lovePassId
            };

            flag=true;
            saveNotify ={
                type : Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
                text :userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"',
            };
            pushData = {
                type:  Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
                msg: userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"',
                ideaId:  payloadData.ideaId,
                byUser : userData._id,
            }

        }
        else {                                                      //passIt   passIt
            data = {
                passIt : payloadData.lovePassId
            };

            if(!(JSON.stringify(checkData[0].passIt) === JSON.stringify(payloadData.lovePassId))){
                flag=true;
                saveNotify ={
                    text :userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"'
                };

                pushData = {
                    type:  Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
                    msg: userData.fullName+' changed insight for "'+payloadData.ideaTitle+'"',
                    ideaId:  payloadData.ideaId,
                    byUser : userData._id,
                }
            }
        }
        await updateData(Modal.Stats,{_id:checkData[0]._id},data,{});

        if(flag) await updateData(Modal.Notify,{_id:notifyData[0]._id},saveNotify,{});

        if(flag) pushNotification.sendPush(userDetail[0].deviceToken,pushData);
    }
    else {

        if(payloadData.type ===1){

            dataToSet ={$inc :{loveItCount:1}};

            let dataToSave = {
                userId : userData._id,
                ideaId : payloadData.ideaId,
                loveIt : payloadData.lovePassId,
                createdOn : new Date(),
                month : new Date().getMonth() + 1,
                year : new Date().getFullYear(),
                type : Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
                isDeleted : false
            };
            await saveData(Modal.Stats,dataToSave);

            let saveNotify = {
                byUser : userData._id,
                userId : payloadData.userId,
                ideaId : payloadData.ideaId,
                text : userData.fullName+' loved "'+payloadData.ideaTitle+'"',
                type : Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
            };
            await saveData(Modal.Notify,saveNotify);

            let pushData = {
                type:  Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
                msg: userData.fullName+' loved "'+payloadData.ideaTitle+'"',
                ideaId:  payloadData.ideaId,
                byUser : userData._id,
            };
            pushNotification.sendPush(userDetail[0].deviceToken,pushData);
        }
        else {
            dataToSet ={$inc :{passItCount:1}};

            let dataToSave = {
                userId : userData._id,
                ideaId : payloadData.ideaId,
                passIt : payloadData.lovePassId,
                createdOn : new Date(),
                month : new Date().getMonth() + 1,
                year : new Date().getFullYear(),
                type : Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
                isDeleted : false
            };
            await saveData(Modal.Stats,dataToSave);

            let saveNotify = {
                byUser : userData._id,
                userId : payloadData.userId,
                ideaId : payloadData.ideaId,
                text : userData.fullName+' passed "'+payloadData.ideaTitle+'"',
                type : Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
            };
            await saveData(Modal.Notify,saveNotify);

            let pushData = {
                type:  Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
                msg: userData.fullName+' passed "'+payloadData.ideaTitle+'"',
                ideaId:  payloadData.ideaId,
                byUser : userData._id,
            };
            pushNotification.sendPush(userDetail[0].deviceToken,pushData);
        }
    }
   /* else if(payloadData.flag===false && payloadData.type===1){
        dataToSet ={$inc :{loveItCount : -1}};

        let dataToSave ={isDeleted : true};
       await updateData(Modal.Stats,loveCriteria,dataToSave,{new:true});
    }
    else {
        dataToSet ={$inc :{passItCount : -1}};

        let dataToSave ={isDeleted : true};
       await updateData(Modal.Stats,passCriteria,dataToSave,{new:true});
    }*/

    let updatedResult = await updateData(Modal.Ideas,criteria,dataToSet,{new:true});
    let dataToSend = {
        loveItCount:updatedResult.loveItCount,
        passItCount:updatedResult.passItCount
    };
    if(payloadData.type===1) dataToSend.loveIt = payloadData.lovePassId;
    else dataToSend.passIt = payloadData.lovePassId;
    return dataToSend
}

async function getIdeaDetails(payloadData,userData) {

    let populate = [
        {
            path: "stageId",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "foundingMembers",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "advisors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "investors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    let getData = await getRequiredPopulate(Modal.Ideas,{_id:payloadData.ideaId}, {},{lean:true}, populate);

    let criteria ={
        ideaId: getData[0]._id,
        userId: userData._id,
        type:Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEIDEA,
        isDeleted : false
    };
    let get =await getRequired(Modal.Stats,criteria, {_id: 1},{lean: true});
    get.length ? getData[0].favourite =true : getData[0].favourite=false;

   /* let criteria1  = {
        ideaId: getData[0]._id,
        userId: userData._id,
        type:Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
        shareOn : Config.APP_CONSTANTS.DATABASE.SHARE_ON.FACEBOOK
    };
    let fbShare = await getRequired(Modal.Stats,criteria1, {_id: 1},{lean: true});
    fbShare ? getData[0].shareOnFacebook =true : getData[0].shareOnFacebook = false;

    let criteria2  = {
        ideaId: getData[0]._id,
        userId: userData._id,
        type:Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
        shareOn : Config.APP_CONSTANTS.DATABASE.SHARE_ON.TWITTER
    };
    let linkedinShare = await getRequired(Modal.Stats,criteria2, {_id: 1},{lean: true});
    linkedinShare.length ? getData[0].shareOnLinkedin =true : getData[0].shareOnLinkedin = false;

    let criteria3  = {
        ideaId: getData[0]._id,
        userId: userData._id,
        type:Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
        shareOn : Config.APP_CONSTANTS.DATABASE.SHARE_ON.TEXT_EMAIL
    };

    let textShare = await getRequired(Modal.Stats,criteria3, {_id: 1},{lean: true});
    textShare.length ? getData[0].shareOnText =true : getData[0].shareOnText = false;

    let criteria4  = {
        ideaId: getData[0]._id,
        userId: userData._id,
        type:Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
        shareOn : Config.APP_CONSTANTS.DATABASE.SHARE_ON.OTHERS
    };

    let otherShare = await getRequired(Modal.Stats,criteria4, {_id: 1},{lean: true});
    otherShare.length ? getData[0].shareOnOther =true : getData[0].shareOnOther = false;
*/
    let report = await getRequired(Modal.ReportIdeas,{ideaId:payloadData.ideaId,reportBy:userData._id},{},{});
    report.length ? getData[0].reported =true : getData[0].reported = false;

    let lovePass = await getRequired(Modal.Stats,{ideaId:payloadData.ideaId,userId:userData._id},{},{});
    if(lovePass.length) {
        if(lovePass[0].type === 0) getData[0].loveIt = lovePass[0].loveIt;
        else getData[0].passIt = lovePass[0].passIt
    }

    JSON.stringify(getData[0].userId)===JSON.stringify(userData._id)?getData[0].ownIdea =true : getData[0].ownIdea=false

    return {data:getData}
}

async function shareIdea(payloadData,userData) {

    //Stats
    let dataToSave = {
        userId : userData._id,
        ideaId : payloadData.ideaId,
        type : Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
        shareOn : payloadData.type,
        month : new Date().getMonth() + 1,
        year : new Date().getFullYear(),
        createdOn :new Date()
    };
    await saveData(Modal.Stats,dataToSave);
   let ideaData= await  updateData(Modal.Ideas,{_id:payloadData.ideaId},{$inc:{shareCount:1}},{new:true});

    if(JSON.stringify(ideaData.userId)!== JSON.stringify(userData._id)){
        //Notification
        let saveNotify = {
            byUser : userData._id,
            userId : payloadData.userId,
            ideaId : payloadData.ideaId,
            text : userData.fullName+' shared "'+payloadData.ideaTitle+'"',
            type : Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
        };
        await saveData(Modal.Notify,saveNotify);
        let userDetail =  await getRequired(Modal.Users,{_id:payloadData.userId},{deviceToken:1},{lean:true});

        //Send push
        let pushData = {
            type:  Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
            msg:  userData.fullName+' shared "'+payloadData.ideaTitle+'"',
            ideaId:  payloadData.ideaId,
            byUser : userData._id,
        };
        pushNotification.sendPush(userDetail[0].deviceToken,pushData);
    }
    return {}
}

async function getSummary(payloadData,userData) {
    let shareData=[],loveData=[],passData=[],loveCount,passCount,count;
    let criteria = {
        userId : userData._id,
        isBlocked : false
    },ideaIds=[],countCriteria={},loveCriteria={},passCriteria={},month = new Date().getMonth() +1,year = new Date().getFullYear();

   /* let data = await getRequired(Modal.Ideas,criteria,{_id:1},{lean:true});
        data.map((obj)=>{
            ideaIds.push(obj._id)
        });*/

             countCriteria ={
                //ideaId  :{$in:ideaIds},
                userId : userData._id,
                type : Config.APP_CONSTANTS.DATABASE.TYPE.SHARE,
            };
            count = await getCount(Modal.Stats,countCriteria);

            loveCriteria ={
                userId : userData._id,
                //ideaId  :{$in:ideaIds},
                type : Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT,
                isDeleted:false
            };
            loveCount = await getCount(Modal.Stats,loveCriteria);

            passCriteria ={
               // ideaId  :{$in:ideaIds},
                isDeleted:false,
                userId : userData._id,
                type : Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT,
            };
            passCount = await getCount(Modal.Stats,passCriteria);


        switch (payloadData.type){
            case 0 :{

                //if(ideaIds.length)
                   return {data : [{name:"LOVE IT",count : loveCount},{name:"PASS IT",count : passCount},{name:"SHARE IT",count : count}],totalCount : count+loveCount+passCount}
                //else
                   // return {data : [{name:"LOVE IT",count : 0},{name:"PASS IT",count : 0},{name:"SHARE IT",count : 0}],totalCount : 0}
            }
            case 1 :{

                        let pipeline = [
                            {$match : countCriteria},
                            {$group : {
                                _id : "$shareOn",
                                count : {$sum :1}
                            }},
                            {$sort : {'_id.count':-1}},
                            {$project : {_id:0,type :"$_id",count:1}},

                        ];
                        shareData  = await aggregate(Modal.Stats,pipeline);
                        if(shareData.length){
                            return {data : shareData,totalCount :count};
                        }
                        else {
                            shareData = [{"type": 3, "count": 0}, {"type": 2, "count": 0},{"type": 1, "count": 0},{"type": 0, "count": 0}];
                            return {data : shareData,totalCount :0};
                        }
            }
            case 2 :{

                let loveIds =await getRequired(Modal.LoveIt,{isBlocked:false},{},{lean:true});

                    for(let i=0;i<loveIds.length;i++){
                        loveCriteria.loveIt = loveIds[i]._id;
                        let getData = await getCount(Modal.Stats,loveCriteria);
                        loveData.push({name :loveIds[i].name,count : getData});
                    }
                    return {data : loveData,totalCount :loveCount};
            }
            case 3 :{

                let passIds = await getRequired(Modal.PassIt,{isBlocked:false},{},{lean:true});

                    for(let i=0;i<passIds.length;i++){
                        passCriteria.passIt = passIds[i]._id;
                        let getData = await getCount(Modal.Stats,passCriteria);
                        passData.push({name :passIds[i].name,count : getData});
                    }
                    return {data : passData,totalCount :passCount};
            }
        }
}

async function getNotifications(payloadData,userData) {
    let data;
    if(payloadData.clearAll){
        let criteria = {
            userId : userData._id,
            isDeleted : false
        };
        await multiUpdateData(Modal.Notify,criteria,{isDeleted:true},{multi:true});
    }
    else {

        let criteria = {
            userId : userData._id,
            isDeleted : false
        };
        let options ={
            lean : true,
            skip : (payloadData.pageNo-1) * 20,
            limit : 20,
            sort:{_id:-1}
        };
        data = await getRequired(Modal.Notify,criteria,{},options);
    }
    return data
}

async function reportIdea(payloadData,userData) {

    let dataToSave = {
        ideaId:payloadData.ideaId,
        reportBy:userData._id,
        description:payloadData.description,
    };
    await saveData(Modal.ReportIdeas,dataToSave);
    return {}
}

async function getAppVersion() {
    let data = await getRequired(Modal.AppVersions,{},{},{})
    return data[0]
}

async function getIdeaLovePass(payloadData,userData) {
    let criteria = {
        ideaId:payloadData.ideaId,
    };
    if(payloadData.type===1) criteria.type = Config.APP_CONSTANTS.DATABASE.TYPE.LOVEIT;
    else if(payloadData.type===2) criteria.type = Config.APP_CONSTANTS.DATABASE.TYPE.PASSIT;
    else criteria.type = Config.APP_CONSTANTS.DATABASE.TYPE.SHARE;

    let populate = [
        {
            path: "userId",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "loveIt",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "passIt",
            select: "name",
            match: {},
            option: {lean: true}
        },{
            path: "ideaId",
            select: "ideaTitle",
            match: {},
            option: {lean: true}
        },
    ];
    let project ={
        userId:1,
        loveIt :1,
        passIt:1,
        shareOn:1,
        ideaId:1
    };
    let data = await getRequiredPopulate(Modal.Stats,criteria,project,{lean:true,sort:{_id:-1}},populate);
    let result={},array=[],array1=[],count=0;
    if(payloadData.type===1){
        let loveIds = await getRequired(Modal.LoveIt,{isBlocked:false},{},{lean:true});
        // if(data.length){
        //     //array=[]
        //     for(let i=0;i<loveIds.length;i++){
        //         for(let j=0;j<data.length;j++){
        //             if(JSON.stringify(loveIds[i]._id) === JSON.stringify(data[j].loveIt._id))
        //             {
        //                 console.log("2222222222222222222222",i,j,JSON.stringify(loveIds[i]._id),JSON.stringify(data[j].loveIt._id))
        //                 array.push({name:loveIds[i].name,count:++count})
        //             }
        //
        //            else{
        //                 console.log("333333333333333333333333",i,j,JSON.stringify(loveIds[i]._id),JSON.stringify(data[j].loveIt._id))
        //                 array1.push({name:loveIds[i].name,count:0})
        //             }
        //
        //         }
        //     }
        // }
        // else {
        //     for(let i=0;i<loveIds.length;i++){
        //         array.push({name :loveIds[i].name,count : 0});
        //     }
        // }
        for(let i=0;i<loveIds.length;i++){
            result[loveIds[i].name] = 0
        }
        for(let j=0;j<data.length;j++){
            ++result[data[j]["loveIt"]["name"]]
        }
        _.map(result, function(v, k, a) {
        // array.push(_.pick(a, k))
         array.push({name:k,count:v})
        })
    }
    else {
        let passIds = await getRequired(Modal.PassIt,{isBlocked:false},{},{lean:true});
        // if(data.length){
        //     console.log('@@@@@@@@@@@@@@@')
        //     for(let i=0;i<passIds.length;i++){
        //         for(let j=0;j<data.length;j++){
        //             console.log('%%%%%%%%%%%%%%%%%%%')
        //             if(passIds[i].name ===data[j].passIt.name)
        //                 array.push({name:passIds[i].name,count:++count})
        //             else array.push({name:passIds[i].name,count:0})
        //         }
        //     }
        // }
        // else {
        //     console.log('!!!!!!!!!!!!!!!!')
        //     array=[]
        //     for(let i=0;i<passIds.length;i++){
        //         array.push({name :passIds[i].name,count : 0});
        //     }
        // }
        for(let i=0;i<passIds.length;i++){
            result[passIds[i].name] = 0
        }
        for(let j=0;j<data.length;j++){
            ++result[data[j]["passIt"]["name"]]
        }
        _.map(result, function(v, k, a) {
            // array.push(_.pick(a, k))
            array.push({name:k,count:v})
        })
    }
    return {data:data,summary:array,totalCount:data.length}
}

async function blockUser(payloadData,userData) {

    let c1={user1: userData._id,user2: payloadData.userId};
    let c2={user1:payloadData.userId,user2: userData._id};
    let user1 = false,dataToUp={};
    let criteria = {
            $or:[c1,c2]
    };
   let result=  await getRequired(Modal.Chats,criteria,{},{lean:true});
    if(result.length){
        if(JSON.stringify(result[0].user1)===JSON.stringify(userData._id))
            user1=true;
        if(user1 && payloadData.action)
            dataToUp = {blockByUser1 : true};
        else if(user1 && payloadData.action===false)
            dataToUp = {blockByUser1 : false};
        else if(user1===false && payloadData.action)
            dataToUp = {blockByUser2 : true};
        else if(user1===false && payloadData.action===false)
            dataToUp = {blockByUser2 : false};

        await updateData(Modal.Chats,criteria,dataToUp,{});

        return {}
    }
    else {

        let data= {
            user1 : payloadData.userId,
            user2: userData._id,
            messages:[],
            chatCreateTime:+new Date(),
            blockByUser1:false,
            blockByUser2:true
        };
        await saveData(Modal.Chats,data);
        return {}
    }

}

// async function getUserDetails(payloadData,userData) {

//     let criteria = {
//         _id : payloadData.userId,
//     };
//     let option = {
//         lean : true,
//     };
//     let project = {
//         accessToken :0,
//         password:0,
//         deviceToken:0,
//         facebookId:0

//     };
//     let userPopulate = [
//         {
//             path: "lookingFor",
//             select: "name",
//             match: {},
//             option: {lean: true}
//         }
//     ];
//     let getResult = await getRequiredPopulate(Modal.Users,criteria,project,option,userPopulate);
//         let c1={user1: userData._id,user2:payloadData.userId};
//         let c2={user1:payloadData.userId,user2: userData._id};

//         let result = await getRequired(Modal.Chats,{$or: [c1,c2]},{_id:1},{});
//         if(result.length)
//             getResult[0].chatExist=result[0]._id;

//     let criteria1 = {
//         isBlocked: false,
//         isDeleted: false,
//         userId : payloadData.userId,
//         status :  Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
//     };

//     let option1 = {
//         lean: true,
//         sort: {_id: -1},
//     };
//     let populate = [
//         {
//             path: "stageId",
//             select: "name",
//             match: {},
//             option: {lean: true}
//         },
//         {
//             path: "lookingFor",
//             select: "name",
//             match: {},
//             option: {lean: true}
//         }, {
//             path: "foundingMembers",
//             select: "fullName imageUrl",
//             match: {},
//             option: {lean: true}
//         }, {
//             path: "advisors",
//             select: "fullName imageUrl",
//             match: {},
//             option: {lean: true}
//         }, {
//             path: "investors",
//             select: "fullName imageUrl",
//             match: {},
//             option: {lean: true}
//         }
//     ];
//     getResult[0].ideas = await getRequiredPopulate(Modal.Ideas, criteria1, {}, option1, populate);

//     let favCriteria = {
//         favouriteUser : payloadData.userId,
//         userId: userData._id,
//         type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE,
//         isDeleted:false
//     };

//     let checkFav = await getRequired(Modal.Stats,favCriteria,{_id:1},{});

//     if(checkFav.length) getResult[0].isFavourite=true;
//     else getResult[0].isFavourite=false;

//     return getResult[0];

// }

async function getUserDetails(payloadData,userData) {

    let criteria = {
        _id : payloadData.userId,
    };
    let option = {
        lean : true,
    };
    let project = {
        accessToken :0,
        password:0,
        deviceToken:0,
        facebookId:0

    };
    let userPopulate = [
        
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        },{
            path: "currentLocation",
            select: "name",
            match: {},
            option: {lean: true}
        }
    ];
    let getResult = await getRequiredPopulate(Modal.Users,criteria,project,option,userPopulate);
    // console.log('currentLocation: ',getResult[0].currentLocation);
        // let criteria_city={};
        // criteria_city._id =getResult[0].currentLocation;
        // let getcity = await getRequired(Modal.Cities,criteria_city,{_id:1,name:1,country:1},{lean:true,sort:{name:1}});
        // // console.log("getCity:", getcity);
        // getResult[0].currentLocation=getcity;
    
        let c1={user1: userData._id,user2:payloadData.userId};
        let c2={user1:payloadData.userId,user2: userData._id};

        let result = await getRequired(Modal.Chats,{$or: [c1,c2]},{_id:1},{});
        if(result.length)
            getResult[0].chatExist=result[0]._id;

    let criteria1 = {
        isBlocked: false,
        isDeleted: false,
        userId : payloadData.userId,
        status :  Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE
    };

    let option1 = {
        lean: true,
        sort: {_id: -1},
    };
    let populate = [
        {
            path: "stageId",
            select: "name",
            match: {},
            option: {lean: true}
        },
        {
            path: "lookingFor",
            select: "name",
            match: {},
            option: {lean: true}
        }, {
            path: "foundingMembers",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "advisors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }, {
            path: "investors",
            select: "fullName imageUrl",
            match: {},
            option: {lean: true}
        }
    ];
    getResult[0].ideas = await getRequiredPopulate(Modal.Ideas, criteria1, {}, option1, populate);

    let favCriteria = {
        favouriteUser : payloadData.userId,
        userId: userData._id,
        type : Config.APP_CONSTANTS.DATABASE.TYPE.FAVOURITEPEOPLE,
        isDeleted:false
    };

    let checkFav = await getRequired(Modal.Stats,favCriteria,{_id:1},{});

    if(checkFav.length) getResult[0].isFavourite=true;
    else getResult[0].isFavourite=false;

    return getResult[0];

}

async function getMessages(payloadData,userData) {
    let dataToSend =[];
    let pipeline = [
        {
            $match : {_id:mongoose.Types.ObjectId(payloadData.chatId)}
        },
        {
            $lookup: {
                "from": "users",
                "localField": "user1",
                "foreignField": "_id",
                "as": "user1"
            }
        },
        {
            $lookup: {
                "from": "users",
                "localField": "user2",
                "foreignField": "_id",
                "as": "user2"
            }
        },

        {$unwind: {path: "$user1", preserveNullAndEmptyArrays: true}},
        {$unwind: {path: "$user2", preserveNullAndEmptyArrays: true}},
        {$unwind: {path: "$messages", preserveNullAndEmptyArrays: true}},

        {$sort: {'messages.sentAt': 1}},
        // {$skip: parseInt(payloadData.pageNo * 20)},
        // {$limit: 20},
        {
            $group: {
                _id: '$_id',
                user1: {
                    $min: {
                        _id: '$user1._id',
                        fullName: '$user1.fullName',
                        location: '$user1.location',
                        imageUrl: '$user1.imageUrl'
                    }
                },
                user2: {
                    $min: {
                        _id: '$user2._id',
                        fullName: '$user2.fullName',
                        location: '$user2.location',
                        imageUrl: '$user2.imageUrl'
                    }
                },
                blockByUser1 : {$min:'$blockByUser1'},
                blockByUser2 : {$min:'$blockByUser2'},
                'messages': {$push: '$messages'}
            }
        },
    ];

    let result = await aggregate(Modal.Chats,pipeline);

    if(result.length){

        // if(result[0].blockByUser1 || result[0].blockByUser2)
        //     result[0].isBlocked = true;
        // else  result[0].isBlocked = false;
        if (JSON.stringify(result[0].user1._id) === JSON.stringify(userData._id)) {
            delete result[0].user1;
            result[0].isBlocked = result[0].blockByUser1;
            dataToSend.push(result[0])
        }
        else {
            delete result[0].user2;
            result[0].user2 = result[0].user1;
            delete result[0].user1;
            result[0].isBlocked = result[0].blockByUser2;
            dataToSend.push(result[0])
        }

        return dataToSend
    }
    else {

    }


}

async function getChats(payloadData,userData) {

    let criteria = {
        $or: [{user1: userData._id}, {user2: userData._id}]
    },dataToSend=[];
    let populate = [
        {
            path: 'user1',
            match: {},
            select: {fullName: 1,imageUrl: 1},
            options: {}
        },
        {
            path: 'user2',
            match: {},
            select:  {fullName: 1,imageUrl: 1},
            options: {}
        }
    ];
    let data = await getRequired(Modal.Chats,criteria,{},{lean:true});
    if(data.length){
        let count = 0
        for(let i =0;i<data.length;i++){

            let criteria = {};

            if (JSON.stringify(data[i].user1) === JSON.stringify(userData._id)) {
                criteria = {
                    $and: [{user1: userData._id}, {user2: data[i].user2}],
                };
            }
            else criteria = {$and: [{user1: data[i].user1}, {user2: userData._id}]};

            let projection = {
                messages: {$slice: -1},
                chatCreateTime: 1,
                user1: 1,
                user2: 1
            };
            let result = await getRequiredPopulate(Modal.Chats,criteria,projection,{lean:true},populate);
            count++;
                if(result.length){
                    //_.filter(result, function (o) {
                        if (JSON.stringify(result[0].user1._id) === JSON.stringify(userData._id)) {
                            delete result[0].user1;
                            dataToSend.push(result[0])
                        }
                        else {
                            delete result[0].user2;
                            result[0].user2 = result[0].user1;
                            delete result[0].user1;
                            dataToSend.push(result[0])
                        }
                   // });
                }
                else {

                }
            if(data.length===count)
                return dataToSend
        }
    }
    else
    return dataToSend
}

module.exports = {
            userDelete:userDelete,

    userSignUp: userSignUp,
    login: login,
    logout: logout,
    socialLogin: socialLogin,
    getData: getData,
    updateProfile: updateProfile,
    changePassword: changePassword,
    forgotPassword: forgotPassword,
    addEditIdea: addEditIdea,
    exploreIdeas: exploreIdeas,
    explorePeople:explorePeople,
    changeStatus:changeStatus,
    VCChangeStatus:VCChangeStatus,
    getMyIdeas:getMyIdeas,
    searchUser:searchUser,
    favPeopleIdea:favPeopleIdea,
    getIdeaPeople:getIdeaPeople,
    lovePassIdea:lovePassIdea,
    shareIdea:shareIdea,
    getIdeaDetails:getIdeaDetails,
    getPeopleDetails:getPeopleDetails,
    getSummary:getSummary,
    getVCDetails:getVCDetails,
    getNotifications:getNotifications,
    reportIdea:reportIdea,
    getChats:getChats,
    getMessages:getMessages,
    blockUser:blockUser,
    getUserDetails:getUserDetails,
    getAppVersion:getAppVersion,
    getIdeaLovePass:getIdeaLovePass,
    addEditVCs:addEditVCs,
    exploreVCs:exploreVCs,
    exploreAccelerator:exploreAccelerator,
    getMyVCs:getMyVCs,
    searchIdea:searchIdea,
    addEditAccelerator:addEditAccelerator,
    getAcceleratorDetails:getAcceleratorDetails,
    acceleratorChangeStatus:acceleratorChangeStatus,
    getMyAcceletors:getMyAcceletors,
    searchLocation:searchLocation
};