
"use strict";

const Controller = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');

module.exports = [
    {
        method: 'POST',
        path: '/admin/deleteUser',
        config: {
           
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.userDelete(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            },
            description: 'User delete',
            notes: 'User delete',
            auth:'AdminAuth',

            tags: ['api', 'user'],
            validate: {
                payload: {
                    userId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },    
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }

        }
    },
    {
        method: 'POST',
        path: '/admin/login',
        config: {
            handler: function (request, reply) {
                Controller.AdminController.adminLogin(request.payload).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            },
            description: 'admin login api',
            notes: 'admin login api',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    email:Joi.string().lowercase().required(),
                    password:Joi.string().required(),
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/changePassword',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.changePassword(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'change Password',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    oldPassword : Joi.string(),
                    newPassword : Joi.string(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditStage',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addEditStage(request.payload).then(result => {
                        if(request.payload.stageId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
                            else
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'add Edit stage',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    stageId :Joi.string().optional(),
                    name:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditInvestmentStage',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addEditInvestmentStage(request.payload).then(result => {
                        if(request.payload.stageId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
                            else
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'add Edit Investment Stage',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    invStageId :Joi.string().optional(),
                    name:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditInvestmentSize',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addEditInvestmentSize(request.payload).then(result => {
                        if(request.payload.stageId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
                            else
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'add Edit Investment Size',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    invSizeId :Joi.string().optional(),
                    name:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/addEditIndustryLength',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addEditIndustryLength(request.payload).then(result => {
                        if(request.payload.stageId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
                            else
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'add Edit Investment Size',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    indLengnthId :Joi.string().optional(),
                    name:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditLookingFor',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addEditLookingFor(request.payload).then(result => {
                        if(request.payload.Id)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                        else
                            reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'add Edit lookinfor',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    Id:Joi.string().optional(),
                    name:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditLoveIt',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addEditLoveIt(request.payload).then(result => {
                        if(request.payload.loveId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                        else
                            reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'add Edit loveit',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    loveId:Joi.string().optional(),
                    name:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditPassIt',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addEditPassIt(request.payload).then(result => {
                        if(request.payload.passId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                        else
                            reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'add Edit SkipIt',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    passId:Joi.string().optional(),
                    name:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/dashboardData',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.dashboardData(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'dashboardData',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {

                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addAdmin',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.addAdmin(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'addAdmin',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    superAdmin:Joi.number().valid([1,2]).description('1 for true,2 for false'),
                    roles:Joi.array(),
                    name:Joi.string().required(),
                    email:Joi.string().email().required(),
                    password:Joi.string().required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/adminDefault',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.adminDefault(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else{
                    reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
                }
            },
            description: 'adminDefault',
            auth:'AdminAuth',
            tags: ['api'],

            validate: {
                payload: {
                    termsAndCondition:Joi.string(),
                    privacyPolicy:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/blockData',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.blockData(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'blockData',
            auth:'AdminAuth',
            tags: ['api'],

            validate: {
                payload: {
                    id:Joi.string().required(),
                    type :Joi.number().valid([1,2,3,4,5,6,7,8,9]).required().description('1 - stage,2 - lookingFor,3 - loveIt ,4 - passIt,5 - users,6 - idea, 7-investment stage, 8-investment size, 9 - industry length').optional(),
                    action  : Joi.boolean().valid([true,false]).required()

                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/admin/getData',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData.id){
                    Controller.AdminController.getData(request.query).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'addAdmin',
            auth:'AdminAuth',
            tags: ['api'],
            validate: {
                query: {
                    flag:Joi.number().required().valid([1,2,3,4,5,6,7,8,9,10]).description('1 stage,2 looking for,3 loveit,4 passit,5 - users,6 - ideas, 7 -reported ideas,8 - investment stage, 9 - investment size,10 - industry Length'),
                    skip:Joi.number(),
                    limit:Joi.number(),
                    search:Joi.string()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responses:Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

];