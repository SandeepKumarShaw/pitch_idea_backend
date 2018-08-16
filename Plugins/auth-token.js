
let UniversalFunctions = require('../Utils/UniversalFunction');
const TokenManager = require('../Lib/TokenManager');
const Config = require('../Config');

exports.register = function(server, options, next){

    server.register(require('hapi-auth-bearer-token'), function (err) {

        server.auth.strategy('UserAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validateFunc: function (token, callback) {
                if(!token){
                    callback(null, true,{})
                }
                else {
                    TokenManager.verifyToken(token,'USER', function (err,response) {
                        if (err || !response || !response.userData){
                            callback(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED))
                        }else {
                            if(response.userData.isBlocked === false){
                                callback(null, true, {token: token, userData: response.userData})
                            }else {
                                callback(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED))
                            }
                        }
                    });
                }

            }
        });

        server.auth.strategy('AdminAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validateFunc: function (token, callback) {
                TokenManager.verifyToken(token,'ADMIN',function (err,response) {
                    if (err || !response || !response.userData){
                        callback(null, false, {token: token, userData: null})
                    }else {
                        callback(null, true, {token: token, userData: response.userData})
                    }
                });
            }
        });

    });

    next();
};



exports.register.attributes = {
    name: 'auth-token-plugin'
};
