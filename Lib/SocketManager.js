
'use strict';

const TokenManager        = require('../Lib/TokenManager'),
    Config              = require('../Config'),
    //UniversalFunctions  = require('../Utils/UniversalFunctions'),
    Controller          = require('../Controllers'),
    Service             = require('../Services').queries,
    Models              = require('../Models'),
    pushNotification = require('../Lib/pushNotification'),

    mongoose            = require('mongoose'),
    async            = require('async');

let   io                  = require('socket.io');
let   socketInfo          = {};


exports.connectSocket = function (server) {

    io = io.listen(server.listener);
    io.on('connection', function (socket) {
        console.log("socket id is....",socket.id,'userId>>>>>',socket.handshake.query);
        if(socket.id){
            socketInfo[socket.handshake.query.userId]=socket.id;
            Service.findAndUpdate(Models.Users,{_id:socket.handshake.query.userId},{socketId:socket.id},{},(err)=>{

                });
            console.log('socket id saved > >>>>',socketInfo)

        }else{
            io.emit('error','Socket is not connected')
        }

        socket.on('sendMessage', function (data) { ////senderId,receiverId,message,messageType
            console.log('dataaaaaaaaaaaa',data);
            if (data.senderId && data.receiverId) {
                saveMessage(data, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(".............result.........");
                    }
                })
            } else {
                console.log("data not in format");
            }

        });

        // socket.on('disconnect', function () {
        //     console.log('Socket disconnected---->>>>>>>>>',socketInfo);
        //
        //     if (socketInfo.hasOwnProperty(socket.id)) var userId = socketInfo[socket.id];
        //     if (socketInfo.hasOwnProperty(userId)) delete socketInfo[userId];
        //     if (socketInfo.hasOwnProperty(socket.id)) delete socketInfo[socket.id];
        //
        // });

    });


};

const saveMessage = function (data, callback) {
    let chatExist = false;
    let saveChat;
    let message = {};
    data.sentAt = +new Date();
    let c1={user1: data.senderId,user2: data.receiverId};
    let c2={user1:data.receiverId,user2: data.senderId};

    async.auto({

        checkBlock:function (cb) {
            let criteria= {
                $or:[
                    {
                        user1: data.senderId,
                        user2: data.receiverId,
                        $or:[{blockByUser1:true},{blockByUser2:true}],
                    },
                    {
                        user1: data.receiverId,
                        user2: data.senderId,
                        $or:[{blockByUser1:true},{blockByUser2:true}],
                    }
                ],

            };
            Service.getData(Models.Chats,criteria, {_id:1},{lean:true},(err, res)=> {
                console.log("check.................block", err, res);
                if (err)
                    cb(err);
                else {
                    if (res.length) {
                        callback();
                    }
                    else {
                        cb();
                    }
                }
            })
        },
        checkChat:['checkBlock',function (err,cb) {
            let criteria= {
                $or: [c1,c2]
            };
            Service.getData(Models.Chats,criteria, {_id:1}, {lean:true}, function (err, res) {
                console.log("check", err, res);
                if (err)
                    cb(err);
                else {
                    if (res.length > 0) {
                        chatExist = true;
                        cb();
                    }
                    else cb()
                }
            })
        }],
        createChat: ['checkChat', function (err,cb) {
            let dataToSet={};
            if (!chatExist) {
                if(data.original){
                    dataToSet =
                        {
                            user1: data.senderId,
                            chatCreateTime:+new Date(),
                            user2: data.receiverId,
                            messages: [{
                                imageUrl:{
                                    original:data.original,
                                    thumbnail:data.thumbnail
                                },
                                senderId:data.senderId,
                                messageType :data.messageType,
                                sentAt: +new Date(),
                                message:data.message,
                            }]
                        };
                }
                else {
                    dataToSet =
                        {
                            user1: data.senderId,
                            chatCreateTime:+new Date(),
                            user2: data.receiverId,
                            messages: [{
                                senderId:data.senderId,
                                messageType :data.messageType,
                                sentAt: +new Date(),
                                message:data.message,
                            }]
                        };
                }
                    Service.saveData(Models.Chats,dataToSet, function (err, res) {
                    saveChat=res;
                    cb();
                    })
            }
            else {
                let criteria = {
                    $or: [c1,c2]
                };
                if(data.original){
                    dataToSet =
                        {
                            $push: {
                                messages: {
                                    imageUrl:{
                                        original:data.original,
                                        thumbnail:data.thumbnail
                                    },
                                    senderId:data.senderId,
                                    message: data.message,
                                    messageType:data.messageType,
                                    sentAt:+new Date(),
                                }
                            }
                        };
                }
                else {
                    dataToSet =
                        {
                            $push: {
                                messages: {
                                    senderId:data.senderId,
                                    message: data.message,
                                    messageType:data.messageType,
                                    sentAt:+new Date(),
                                }
                            }
                        };
                }

                Service.findAndUpdate(Models.Chats,criteria, dataToSet,{new:true},(err, res)=> {
                    if (err)
                        cb(err);
                    else{
                        saveChat=res;
                        cb();
                    }
                })
            }
        }],
        sendSocketMessage: ['createChat', function (err,cb) {
            let to = socketInfo[data.receiverId];

            console.log('tooooooooooooooooo',to);

            if(to!==undefined){
                io.to(to).emit("message",data);
            }
            else {
               Service.getData(Models.Users,{_id:data.receiverId},{socketId:1},{lean:true},(err,res)=>{
                   if(res[0].socketId){
                       io.to(res[0].socketId).emit("message",data);
                   }
               })

            }

            let criteria = {
                $or: [c1,c2]
            };
            let populate = [
                {
                    path: 'user1',
                    match: {},
                    select: {deviceToken:1,fullName:1},
                    options: {}
                },
                {
                    path: 'user2',
                    match: {},
                    select: {deviceToken:1,fullName:1},
                    options: {}
                }
            ];
            Service.populateData(Models.Chats,criteria, {messages:0},{lean: true}, populate,(err, result)=> {
                if(result.length){
                    let deviceToken,pushData;
                    if ((JSON.stringify(result[0].user1._id) === JSON.stringify(data.receiverId)) && !result[0].blockByUser1 ) {
                        pushData={
                            type:5,
                            msg:result[0].user2.fullName+' sent you a message',
                            chatId : saveChat._id,
                            receiverId : data.receiverId
                        };
                        deviceToken = result[0].user1.deviceToken
                    }
                    else if(!result[0].blockByUser2){
                        pushData={
                            type:5,
                            msg : result[0].user1.fullName+' sent you a message',
                            chatId:saveChat._id,
                            receiverId : data.receiverId
                        };
                        deviceToken = result[0].user2.deviceToken
                    }
                    pushNotification.sendPush(deviceToken,pushData,function (err) {
                    });
                    cb()
                }
                else cb()
            })
        }]
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null)
        }
    })
};


