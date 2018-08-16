
'use strict';


const FCM = require('fcm-node');
const serverKey = 'AAAAaQhJ5x8:APA91bE09DP2XrOeX2qO76tQAScVX-SOLQ2uss-7R3sk43mgI6jyOmwLPP2LkSA9DYETf3X9S9ZHDbtM7XGcm56z601DyIIroaWREb1QQGNlY5LHjW3OcCKCQW9ZeUGiHXH6NZRNhKUj';
const fcm = new FCM(serverKey);


let sendPush = function (deviceToken, data){

        console.log("***data******",data,deviceToken);
        return new Promise((resolve , reject)=>{
            let message = {
                to: deviceToken,
                notification: {
                    title:'Launchise',
                    body: data.msg,
                    sound: "default",
                    badge:0
                },
                data:data,
                priority: 'high'
            };
            fcm.send(message, function(err, result){
                if (err) {
                    console.log("Something has gone wrong!",err);
                    resolve(null);
                } else {
                    console.log("Successfully sent with response: ", result);
                    resolve(null,result);
                }
            });
         })
};

module.exports = {
    sendPush: sendPush
};