
"use strict";

const Service = require('../Services').queries;
const UniversalFunctions = require('../Utils/UniversalFunction');
// const async = require('async');
const Config = require('../Config');
const TokenManager = require('../Lib/TokenManager');
const emailFunction = require('../Lib/email');
const _ = require('lodash');
const UploadManager = require('../Lib/UploadManager');
const  UploadMultipart = require('../Lib/UploadMultipart');
const Modal = require('../Models');
let mongoose = require('mongoose');

function login(payloadData) {
    return new Promise((resolve, reject) => {
        let tokenData = {};
        let getCriteria = {
            email: payloadData.email,
        };
        Service.getData(Modal.Admins,getCriteria, {}, {lean:true}, function (err, data) {
            if (err) {
                reject(err);
            } else {
                if (!data || data.length <= 0) {
                    reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
                }
                else {
                    if (data && data[0].password !== UniversalFunctions.CryptData(payloadData.password)) {
                        reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD);
                    } else {
                        tokenData =data[0];
                        tokenData.type= UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN;
                        resolve(tokenData);
                    }
                }
            }
        });
    });
}

function tokenUpdate(tokenData) {
    return new Promise((resolve, reject) => {
            TokenManager.setToken({_id: tokenData._id,type : tokenData.type}, function (err, output) {
                if (err) {
                  reject(err)
                } else {
                    tokenData.accessToken=output.accessToken;
                    resolve(tokenData);
                }
            });
    });
}

async function adminDefault(payloadData) {
   let image,dataToSave={};
   if(payloadData.drawerImage){

       image =  await uploadImage(payloadData.drawerImage);
       dataToSave.drawerImage = image

   }
    if(payloadData.termsAndCondition)
        dataToSave.termsAndCondition = payloadData.termsAndCondition;
    if(payloadData.privacyPolicy)
        dataToSave.privacyPolicy = payloadData.privacyPolicy;

    return new Promise((resolve, reject) => {
        Service.saveData(Modal.AdminDefaults,dataToSave,(err)=>{
            if(err)
                reject(err);
            else
            resolve()
        })
    });
}

async function adminLogin(payloadData) {

    let f1 = login(payloadData);
    let f2 = tokenUpdate(await f1);
    return await f2;
}

async function addEditStage(payloadData) {

    let dataToSave={};

    if(payloadData.name) dataToSave.name = payloadData.name;

    if(payloadData.stageId){

        let criteria={
            _id:payloadData.stageId
        };

        let update = await updateData(Modal.Stage,criteria,dataToSave);
        return  update
    }
    else {
        dataToSave.createdOn = +new Date();
        let saved = await saveData(Modal.Stage,dataToSave);
        return saved
    }

}
async function addEditInvestmentStage(payloadData) {
    console.log('POST DATA: ',payloadData);
    console.log('===========');
    let dataToSave={};

    if(payloadData.name) dataToSave.name = payloadData.name;

    if(payloadData.invstageId){

        let criteria={
            _id:payloadData.invstageId
        };

        let update = await updateData(Modal.InvestmentStage,criteria,dataToSave);
        return  update
    }
    else {
        dataToSave.createdOn = +new Date();
        console.log('dataToSave DATA: ',dataToSave);
        console.log('===========');
        let saved = await saveData(Modal.InvestmentStage,dataToSave);
        console.log(saved);
        return saved
    }

}
async function addEditInvestmentSize(payloadData) {

    let dataToSave={};

    if(payloadData.name) dataToSave.name = payloadData.name;

    if(payloadData.invSizeId){

        let criteria={
            _id:payloadData.invSizeId
        };

        let update = await updateData(Modal.InvestmentSize,criteria,dataToSave);
        return  update
    }
    else {
        dataToSave.createdOn = +new Date();
        let saved = await saveData(Modal.InvestmentSize,dataToSave);
        return saved
    }

}
async function addEditIndustryLength(payloadData) {

    let dataToSave={};

    if(payloadData.name) dataToSave.name = payloadData.name;

    if(payloadData.indLengnthId){

        let criteria={
            _id:payloadData.indLengnthId
        };

        let update = await updateData(Modal.IndustryLength,criteria,dataToSave);
        return  update
    }
    else {
        dataToSave.createdOn = +new Date();
        let saved = await saveData(Modal.IndustryLength,dataToSave);
        return saved
    }

}
async function addEditLookingFor(payloadData) {

    let dataToSave={};

    if(payloadData.name) dataToSave.name = payloadData.name;

    if(payloadData.Id){

        let criteria={
            _id : payloadData.Id,
        };

        let update = updateData(Modal.LookingFor,criteria,dataToSave);
        return await update
    }
    else {
        dataToSave.createdOn = +new Date();
        let saved = saveData(Modal.LookingFor,dataToSave);
        return await saved
    }
}

async function addEditLoveIt(payloadData) {

    let dataToSave={};

    if(payloadData.name) dataToSave.name = payloadData.name;

    if(payloadData.loveId){

        let criteria={
            _id : payloadData.loveId,
        };

        let update = await updateData(Modal.LoveIt,criteria,dataToSave);
        return  update
    }
    else {
        dataToSave.createdOn = +new Date();
        let saved = await saveData(Modal.LoveIt,dataToSave);
        return  saved
    }
}

async function addEditPassIt(payloadData) {

    let dataToSave={};

    if(payloadData.name) dataToSave.name = payloadData.name;

    if(payloadData.passId){

        let criteria={
            _id : payloadData.passId,
        };

        let update = await updateData(Modal.PassIt,criteria,dataToSave);
        return  update
    }
    else {
        dataToSave.createdOn = +new Date();
        let saved = await saveData(Modal.PassIt,dataToSave);
        return  saved
    }
}

function updateData(collection,criteria,dataToUpdate,option) {

    return new Promise((resolve, reject) => {
        Service.findAndUpdate(collection,criteria,dataToUpdate,option, (err, result)=> {
            if (err) {
                reject(err);
            } else {
                resolve(result)
            }
        });
    });
}

function getRequired(collection,criteria,projection,option) {

    return new Promise((resolve, reject) => {
        Service.getData(collection,criteria,projection,option, (err, result)=> {
            if (err) {
                reject(err);
            } else {
                if(result.length)
                resolve(result);
                else resolve([])
            }
        });
    });
}

function uploadImage(image) {
    return new Promise((resolve, reject) => {
        UploadMultipart.uploadFilesOnS3(image,(err,result)=>{
            resolve(result)
        })
    });
}

function saveData(collection,dataToSave) {
    return new Promise((resolve, reject) => {
        Service.saveData(collection,dataToSave, (err, result) =>{
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        });
    });
}

async function addAdmin(payloadData) {

    let data={
        name:payloadData.name,
        email:payloadData.email,
        password:UniversalFunctions.CryptData(payloadData.password),
        roles:payloadData.roles
    };
    if(payloadData.superAdmin ===1) data.superAdmin=true;
    else  data.superAdmin=false;

    return new Promise((resolve, reject) => {
        Service.saveData(Modal.Admins,data, (err, data) =>{
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        });
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

    let criteria ={
            isDeleted:false
    },projection={

    },
    option={
        lean : true,
        skip : payloadData.skip,
        limit : payloadData.limit
    };

    switch (payloadData.flag){
        case 1: {

            if(payloadData.search)
                criteria.name =new RegExp(payloadData.search ,'i');
            criteria.isDeleted=false
            option.sort={name:1};

            let step1 = await getRequired(Modal.Stage,criteria,projection,option);
            let step2 = getCount(Modal.Stage,criteria);

            return {data:step1,count:await step2}
        }
        case 2 :{

            if(payloadData.search)
                criteria.name =new RegExp(payloadData.search ,'i');
            criteria.isDeleted=false
            option.sort={name:1};
            let step1 = await getRequired(Modal.LookingFor,criteria,projection,option);
            let step2 = getCount(Modal.LookingFor,criteria);

            return {data:await step1,count:await step2}
        }
        case 3 :{

            if(payloadData.search)
                criteria.name =new RegExp(payloadData.search ,'i');

            option.sort={name:1};
            let step1 = await getRequired(Modal.LoveIt,criteria,projection,option);
            let step2 = getCount(Modal.LoveIt,criteria);

            return {data:await step1,count:await step2}
        }
        case 4:{

            if(payloadData.search)
                criteria.name =new RegExp(payloadData.search ,'i');

            option.sort={name:1};

            let step1 = await getRequired(Modal.PassIt,criteria,projection,option);
            let step2 = getCount(Modal.PassIt,criteria);

            return {data:await step1,count:await step2}
        }
        case 5:{

            if(payloadData.search)
                criteria = {
                $or : [
                    {fullName : new RegExp(payloadData.search ,'i')},
                    {email : new RegExp(payloadData.search ,'i')},
                    {description : new RegExp(payloadData.search ,'i')},
                ]
                };

            option.sort={_id:1};

            let project ={
                fullName : 1,
                email :1,
                imageUrl : 1,
                isBlocked : 1,
                isDeleted : 1,
                registrationDate : 1
            };

            let step1 =  await getRequired(Modal.Users,criteria,project,option);
            let step2 = await getCount(Modal.Users,criteria);

            return {data: step1,count: step2}
        }
        case 6:{

            if(payloadData.search)
                criteria = {
                $or : [
                    {ideaTitle : new RegExp(payloadData.search ,'i')},
                    {description : new RegExp(payloadData.search ,'i')},
                ]
                };

            option.sort={_id:-1};
            let populate = [
                {
                    path: "userId",
                    select: "fullName email",
                    match: {},
                    option: {lean: true}
                },
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
            let step1 =  await getRequiredPopulate(Modal.Ideas,criteria,projection,option,populate);
            let step2 = await getCount(Modal.Ideas,criteria);

            return {data: step1,count: step2}
        }
        case 7:{

            option.sort={_id:-1};
            let populate = [
                {
                    path: "reportBy",
                    select: "fullName email",
                    match: {},
                    option: {lean: true}
                },
                {
                    path: "ideaId",
                    select: "ideaTitle imageUrl isBlocked",
                    match: {},
                    option: {lean: true}
                },
            ];
            let step1 = await getRequiredPopulate(Modal.ReportIdeas,criteria,projection,option,populate);
            let step2 = getCount(Modal.ReportIdeas,criteria);

            return {data:await step1,count:await step2}
        }
        case 8: {

            if(payloadData.search)
                criteria.name =new RegExp(payloadData.search ,'i');
            criteria.isDeleted=false
            option.sort={name:1};

            let step1 = await getRequired(Modal.InvestmentStage,criteria,projection,option);
            let step2 = getCount(Modal.InvestmentStage,criteria);

            return {data:step1,count:await step2}
        }
        case 9: {

            if(payloadData.search)
                criteria.name =new RegExp(payloadData.search ,'i');
            criteria.isDeleted=false
            option.sort={name:1};

            let step1 = await getRequired(Modal.InvestmentSize,criteria,projection,option);
            let step2 = getCount(Modal.InvestmentSize,criteria);

            return {data:step1,count:await step2}
        }
        case 10: {

            if(payloadData.search)
                criteria.name =new RegExp(payloadData.search ,'i');
            criteria.isDeleted=false
            option.sort={name:1};

            let step1 = await getRequired(Modal.IndustryLength,criteria,projection,option);
            let step2 = getCount(Modal.IndustryLength,criteria);

            return {data:step1,count:await step2}
        }
    }

}

function getCount(collection,criteria) {
    return new Promise((resolve, reject) => {
        Service.count(collection,criteria, (err, result)=> {
            resolve(result);
        });
    });
}

async function blockData(payloadData) {

    let criteria ={},dataToSet={},
        option={new : true};

    switch (payloadData.type){
        case 1: {

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.Stage,criteria,dataToSet,option);

            return {}
        }
        case 2 :{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.LookingFor,criteria,dataToSet,option);

            return {}
        }
        case 3 :{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.LoveIt,criteria,dataToSet,option);

            return {}
        }
        case 4:{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.PassIt,criteria,dataToSet,option);

            return {}
        }
        case 5:{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.Users,criteria,dataToSet,option);

            return {}
        }
        case 6:{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.Ideas,criteria,dataToSet,option);

            return {}
        }
        case 7:{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.InvestmentStage,criteria,dataToSet,option);

            return {}
        }
        case 8:{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.InvestmentSize,criteria,dataToSet,option);

            return {}
        }
        case 9:{

            criteria._id = payloadData.id;
            dataToSet.isBlocked = payloadData.action ===true;
            let step1 = await updateData(Modal.IndustryLength,criteria,dataToSet,option);

            return {}
        }
    }

}

async function dashboardData(payloadData) {

    let data ={};

    data.activeUsers =  await getCount(Modal.Users,{isBlocked:false});
    data.totalUsers =  await getCount(Modal.Users,{});
    data.blockUsers =  await getCount(Modal.Users,{isBlocked:true});
    data.reportedIdeas =  await getCount(Modal.ReportIdeas,{});
    data.totalIdeas = await getCount(Modal.Ideas,{});
    data.archiveIdeas = await getCount(Modal.Ideas,{status:Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ARCHIVED});
    data.activeIdeas = await getCount(Modal.Ideas,{status:Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.ACTIVE});
    data.deletedIdeas = await getCount(Modal.Ideas,{status:Config.APP_CONSTANTS.DATABASE.STATUS_TYPES.DELETED});
    return data


}



module.exports = {

    adminLogin: adminLogin,
    addEditStage:addEditStage,
    addEditInvestmentStage:addEditInvestmentStage,
    addEditInvestmentSize:addEditInvestmentSize,
    addEditIndustryLength:addEditIndustryLength,
    addAdmin:addAdmin,
    adminDefault:adminDefault,
    addEditLookingFor:addEditLookingFor,
    getData:getData,
    addEditLoveIt:addEditLoveIt,
    addEditPassIt:addEditPassIt,
    dashboardData:dashboardData,
    blockData : blockData,

};