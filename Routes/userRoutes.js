
const Joi = require('joi');
const Controller = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Config = require('../Config');

module.exports = [

    {
        method: 'POST',
        path: '/user/signUp',
        config: {
            handler: function (request, reply) {
                Controller.UserController.userSignUp(request.payload).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            },
            description: 'user signup api',
            notes: 'sign up api',
            tags: ['api', 'user'],
            validate: {
                payload: {

                    fullName : Joi.string().trim().required(),
                    socialId : Joi.string().trim().optional(),
                    from:Joi.number().optional().valid([1,2,3]).description('1 - google,2 - fb ,3 -linkdin'),
                    // linkedinId : Joi.string().trim().optional(),
                    email : Joi.string().email().trim().required().lowercase(),
                    password : Joi.string().optional(),
                    deviceToken : Joi.string().optional(),
                    lat:Joi.number().optional().default(0),
                    long:Joi.number().optional().default(0),
                    imageUrl:Joi.string().optional(),
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
        path: '/user/getAppVersion',
        config: {
            handler: function (request, reply) {
                Controller.UserController.getAppVersion().then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            },
            description: 'getAppVersion',
            tags: ['api', 'user'],
            validate: {
                // payload: {
                //
                //     fullName : Joi.string().trim().required(),
                //     socialId : Joi.string().trim().optional(),
                //     from:Joi.number().optional().valid([1,2,3]).description('1 - google,2 - fb ,3 -linkdin'),
                //     // linkedinId : Joi.string().trim().optional(),
                //     email : Joi.string().email().trim().required().lowercase(),
                //     password : Joi.string().optional(),
                //     deviceToken : Joi.string().optional(),
                //     lat:Joi.number().optional().default(0),
                //     long:Joi.number().optional().default(0),
                // },
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
        path: '/user/socialLogin',
        config: {
            handler: function (request, reply) {
                Controller.UserController.socialLogin(request.payload).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            },
            description: 'socialLogin',
            tags: ['api'],
            validate: {
                payload: {
                    socialId : Joi.string().trim().optional(),
                    email : Joi.string().trim().optional(),
                    from:Joi.number().required().valid([1,2,3]).description('1 - google,2 - fb ,3 -linkdin'),
                    deviceToken:Joi.string().optional(),

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
        path: '/user/login',
        config: {
            handler: function (request, reply) {
                Controller.UserController.login(request.payload).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            },

            description: 'Login',
            notes: 'sign up api',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    email : Joi.string().trim().required().lowercase(),
                    password : Joi.string().trim().required(),
                    deviceToken:Joi.string().optional(),
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
        path: '/user/logout',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData) {
                    Controller.UserController.logout(userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            },
            description: 'logout',
            auth:'UserAuth',
            tags: ['api', 'user'],
            validate: {
               /* payload: {

                },*/
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
        path: '/user/getData',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getData(request.query).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get data',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    flag:Joi.number().required().valid([1,2,3,4,5,6,7]).description('1 stage,2 looking for,3 loveit,4 passit, 5 investment stage, 6- investment Size, 7 - Industry Length'),
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
        path: '/user/updateProfile',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.updateProfile(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'update profile',
            auth:'UserAuth',
            tags: ['api'],
            payload: {
                maxBytes: 200000000,
                parse: true,
                output: 'file'
            },
            validate: {
                payload: {

                    notifications : Joi.number().valid([0,1]).description('0 - off ,1 - on'),
                    emailNotifications : Joi.number().valid([0,1]).description('0 - off ,1 - on'),
                    shareLocation : Joi.number().valid([0,1]).description('0 - off ,1 - on'),
                    showIdea : Joi.number().valid([0,1]).description('0 - off ,1 - on'),
                    interests : Joi.string(),
                    description : Joi.string().allow(''),
                    lookingFor : Joi.string(),
                    bestWayToMeet : Joi.string().allow(''),
                    location : Joi.string().allow(''),
                    currentLocation : Joi.string(),
                    fullName : Joi.string(),
                    ideas:Joi.string().optional(),
                    websiteUrl:Joi.string().optional().allow(''),
                    facebookUrl:Joi.string().optional().allow(''),
                    linkedinUrl:Joi.string().optional().allow(''),
                    imageUrl : Joi.any()
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
        path: '/user/changePassword',
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
            auth:'UserAuth',
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
        path: '/user/forgotPassword',
        config: {
            handler: function (request, reply) {
                    Controller.UserController.forgotPassword(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
            },
            description: 'forgot Password',
            tags: ['api'],
            validate: {
                payload: {
                    email : Joi.string().required().lowercase(),
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
        path: '/user/searchUser',
        config: {
            handler: function (request, reply) {
                    Controller.UserController.searchUser(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
            },
            description: 'search User',
            tags: ['api'],
            validate: {
                payload: {
                    name : Joi.string().optional(),
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
        path: '/user/searchLocation',
        config: {
            handler: function (request, reply) {
                    Controller.UserController.searchLocation(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
            },
            description: 'search Location',
            tags: ['api'],
            validate: {
                payload: {
                    name : Joi.string().optional(),
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
        path: '/user/searchIdea',
        config: {
            handler: function (request, reply) {
                    Controller.UserController.searchIdea(request.payload).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
            },
            description: 'search User',
            tags: ['api'],
            validate: {
                payload: {
                    title : Joi.string().optional(),
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
        path: '/user/addEditIdea',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.addEditIdea(request.payload,userData).then(result => {
                        if(request.payload.ideaId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
                        else
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'add Idea',
            auth:'UserAuth',
            tags: ['api'],
            payload: {
                maxBytes: 200000000,
                parse: true,
                output: 'file'
            },
            validate: {
                payload: {

                    ideaId : Joi.string(),
                    ideaTitle : Joi.string(),
                    description : Joi.string(),
                    tags : Joi.array().allow(''),
                    stageId : Joi.string().description('stage id'),
                    lookingFor : Joi.string(),

                    showDetails : Joi.number().valid([0,1]).description('0 - false,1 - true'),
                    problem : Joi.string().allow(''),
                    uniqueSolution : Joi.string().allow(''),
                    targetCustomer : Joi.string().allow(''),
                    businessModel : Joi.string().allow(''),
                    mileStones : Joi.string().allow(''),

                    showTeam : Joi.number().valid([0,1]).description('0 - false,1 - true'),
                    foundingMembers : Joi.string().description('user ids'),
                    advisors : Joi.string(),
                    investors : Joi.string(),

                    showLinks : Joi.number().valid([0,1]).description('0 - false,1 - true'),
                    websiteUrl : Joi.string().allow(''),
                    facebookUrl : Joi.string().allow(''),
                    linkedinUrl : Joi.string().allow(''),
                    lat : Joi.string(),
                    long : Joi.string(),
                    address : Joi.string(),

                    imageUrl : Joi.any(),
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
        path: '/user/addEditVCs',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.addEditVCs(request.payload,userData).then(result => {
                        if(request.payload.ideaId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
                        else
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'add Edit Investment Firm',
            auth:'UserAuth',
            tags: ['api'],
            payload: {
                maxBytes: 200000000,
                parse: true,
                output: 'file'
            },
            validate: {
                payload: {

                    VCId : Joi.string(),
                    investmentFirmName : Joi.string(),
                    description : Joi.string(),

                    showDetails : Joi.number().valid([0,1]).description('0 - false,1 - true'),
                    investmentFocus : Joi.string(),

                    requirements : Joi.string(),
                    invStageId : Joi.string(),
                    investmentSize : Joi.string(),     
                    showTeam : Joi.number().valid([0,1]).description('0 - false,1 - true'),

                    partners : Joi.string(),
                    portfolio : Joi.string(),


                    showLinks : Joi.number().valid([0,1]).description('0 - false,1 - true'),
                    websiteUrl : Joi.string().allow(''),
                    facebookUrl : Joi.string().allow(''),
                    linkedinUrl : Joi.string().allow(''),
                    twitterUrl : Joi.string().allow(''),
                    lat : Joi.string(),
                    long : Joi.string(),
                    address : Joi.string(),

                    imageUrl : Joi.any(),
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
        path: '/user/addEditAccelerator',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.addEditAccelerator(request.payload,userData).then(result => {
                        if(request.payload.ideaId)
                            reply(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
                        else
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'add Edit Accelerators Firm',
            auth:'UserAuth',
            tags: ['api'],
            payload: {
                maxBytes: 200000000,
                parse: true,
                output: 'file'
            },
            validate: {
                payload: {

                    acceleratorId : Joi.string(),
                    acceleratorName : Joi.string(),
                    description : Joi.string(),
                    showDetails : Joi.number().valid([0,1]).description('0 - false,1 - true'),
                    industryFocus : Joi.string(),
                    requirements : Joi.string(),
                    acceleratorLength : Joi.string(),
                    investmentInfo : Joi.string(),        
                    seasons : Joi.string(),    
                    showTeam : Joi.number().valid([0,1]).description('0 - false,1 - true'),        
                    partners : Joi.string(),
                    portfolio : Joi.string(),
                    showLinks : Joi.number().valid([0,1]).description('0 - false,1 - true'),
                    websiteUrl : Joi.string().allow(''),
                    facebookUrl : Joi.string().allow(''),
                    linkedinUrl : Joi.string().allow(''),
                    twitterUrl : Joi.string().allow(''),
                    lat : Joi.string(),
                    long : Joi.string(),
                    address : Joi.string(),

                    imageUrl : Joi.any(),
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
        path: '/user/exploreIdeas',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.exploreIdeas(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'explore Ideas',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    stageId:Joi.string(),
                    lookingFor : Joi.string(),
                    address:Joi.string().optional(),
                    lat : Joi.string(),
                    long : Joi.string(),
                    search : Joi.string(),
                    pageNo : Joi.number().default(1),
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
        path: '/user/explorePeople',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.explorePeople(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'explore People',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    
                    lookingFor : Joi.string().allow(''),
                    interests : Joi.string().allow(''),
                    location:Joi.string().optional(),
                    lat : Joi.string().allow(''),
                    long : Joi.string().allow(''),
                    search : Joi.string().allow(''),
                    pageNo : Joi.number().default(1),
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
        path: '/user/exploreVCs',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.exploreVCs(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'explore Ideas',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    invStageId:Joi.string(),
                    investmentSize:Joi.string(),
                    address:Joi.string().optional(),
                    lat : Joi.string(),
                    long : Joi.string(),
                    search : Joi.string(),
                    pageNo : Joi.number().default(1),
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
        path: '/user/exploreAccelerator',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.exploreAccelerator(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'explore Accelerator',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    
                    acceleratorLength:Joi.string(),
                    address:Joi.string().optional(),
                    lat : Joi.string(),
                    long : Joi.string(),
                    search : Joi.string(),
                    pageNo : Joi.number().default(1),
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
        path: '/user/getMyIdeas',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getMyIdeas(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get my Ideas',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    status : Joi.number().valid([1,2,3]).required().description('ACTIVE:1,ARCHIVED:2,DELETED:3'),
                    pageNo : Joi.number().default(1),
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
        path: '/user/getMyVCs',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getMyVCs(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get my VCs',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    status : Joi.number().valid([1,2,3]).required().description('ACTIVE:1,ARCHIVED:2,DELETED:3'),
                    pageNo : Joi.number().default(1),
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
        path: '/user/getMyAcceletors',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getMyAcceletors(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get my Acceletors',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    status : Joi.number().valid([1,2,3]).required().description('ACTIVE:1,ARCHIVED:2,DELETED:3'),
                    pageNo : Joi.number().default(1),
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
        path: '/user/getIdeaPeople',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getIdeaPeople(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get my Ideas',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    flag : Joi.number().valid([1,2]).required().description('ideas:1,people:2'),
                    pageNo : Joi.number().default(1),
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
        path: '/user/getIdeaDetails',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getIdeaDetails(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get my Ideas',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    ideaId : Joi.string().required(),
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
        path: '/user/getPeopleDetails',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getPeopleDetails(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get people details',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    userId : Joi.string().required(),
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
        path: '/user/getVCDetails',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getVCDetails(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get VC details',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    VCId : Joi.string().required(),
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
        path: '/user/getAcceleratorDetails',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getAcceleratorDetails(request.query,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'get Accelerator details',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                query: {
                    acceleratorId : Joi.string().required(),
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
        path: '/user/changeStatus',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.changeStatus(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'change Status',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    ideaId:Joi.string().required(),
                    status : Joi.number().valid([1,2,3]).required().description('ACTIVE:1,\n' +
                        '        ARCHIVED:2,\n' +
                        '        DELETED:3'),
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
        path: '/user/VCChangeStatus',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.VCChangeStatus(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'investment firm change Status',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    VCId:Joi.string().required(),
                    status : Joi.number().valid([1,2,3]).required().description('ACTIVE:1,\n' +
                        '        ARCHIVED:2,\n' +
                        '        DELETED:3'),
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
        path: '/user/acceleratorChangeStatus',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.acceleratorChangeStatus(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'Acceletor change Status',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    acceleratorId:Joi.string().required(),
                    status : Joi.number().valid([1,2,3]).required().description('ACTIVE:1,\n' +
                        '        ARCHIVED:2,\n' +
                        '        DELETED:3'),
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
        path: '/user/favPeopleIdea',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.favPeopleIdea(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'favPeopleIdea',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    userId:Joi.string().optional().description('for fav people'),
                    ideaId:Joi.string().optional().description('for fav Ideas'),
                    ideaTitle:Joi.string().optional().description('idea title'),
                    type : Joi.number().valid([1,2]).required().description('1 - idea,2- people'),
                    flag: Joi.boolean().valid([true,false]).required()
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
        path: '/user/lovePassIdea',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.lovePassIdea(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'lovePassIdea',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    lovePassId:Joi.string().required(),
                    userId :Joi.string(),
                    ideaId:Joi.string().required(),
                    ideaTitle:Joi.string(),
                    type: Joi.number().valid([1,2]).required().description('1-love, 2 - pass'),
                    flag: Joi.boolean().valid([true,false]).required()
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
        path: '/user/shareIdea',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.shareIdea(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'shareIdea',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    ideaId:Joi.string().required(),
                    ideaTitle:Joi.string().optional(),
                    userId:Joi.string().optional(),
                    type: Joi.number().valid([0,1,2,3]).required().description('0 - facebook, ' +
                        '1 - twitter,2 - text/email,3 - other'),
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
        path: '/user/getSummary',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getSummary(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'summary',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    type : Joi.number().valid([0,1,2,3]).required().description('0- total ,1- share,2-loveit,3- passit'),
                    month:Joi.number().required().description('1-jan,2-feb and so on'),
                    year: Joi.number().required()
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
        path: '/user/getNotifications',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getNotifications(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'getNotifications',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    pageNo:Joi.number().required().default(1),
                    clearAll : Joi.boolean()
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
        path: '/user/reportIdea',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.reportIdea(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'getNotifications',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
                payload: {
                    ideaId:Joi.string().required(),
                    description:Joi.string()

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
        path: '/user/getChats',
        config: {
            handler: function (request, reply) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                if(userData){
                    Controller.UserController.getChats(request.payload,userData).then(result => {
                        reply(UniversalFunctions.sendSuccess(null,result))
                    }).catch(reason => {
                        reply(UniversalFunctions.sendError(reason));
                    });
                }
                else reply(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));

            },
            description: 'getNotifications',
            auth:'UserAuth',
            tags: ['api'],
            validate: {
               /* payload: {
                    ideaId:Joi.string().required(),
                    description:Joi.string()

                },*/
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
        path: '/user/getMessages',
        handler: function (request, reply) {
            let userPayload = request.payload;
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.getMessages(request.payload,userData).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'get Messages',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    chatId:Joi.string().required(),
                    pageNo:Joi.number().default(0)
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/blockUser',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.blockUser(request.payload,userData).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'get Messages',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    userId:Joi.string().required(),
                    action:Joi.boolean().required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/getUserDetails',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.getUserDetails(request.payload,userData).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'get UserDetails',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
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
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/user/getIdeaLovePass',
        handler: function (request, reply) {
            let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.getIdeaLovePass(request.payload,userData).then(result => {
                    reply(UniversalFunctions.sendSuccess(null,result))
                }).catch(reason => {
                    reply(UniversalFunctions.sendError(reason));
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'get IdeaUsers',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    ideaId:Joi.string().required(),
                    type : Joi.number().valid([1,2,3]).required().description('1- love,2 pass, 3 share')
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

];
