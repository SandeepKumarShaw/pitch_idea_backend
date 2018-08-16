const Hapi = require('hapi');
const Config = require('./Config');
const Plugins = require('./Plugins');
const Routes = require('./Routes');
const bootStrap = require('./Utils/bootStrap');
const privacyPolicy = require('./Utils/privacyPolicy');

//Create Server
const server = new Hapi.Server();

//create connection
server.connection({
    port:Config.dbConfig.config.PORT,
    
    routes: { cors: true }
});

bootStrap.connectSocket(server);

//Register All Plugins
server.register(Plugins, function (err) {

    if (err){
        server.error('Error while loading plugins : ' + err)
    }else {
        
        server.route(Routes);
        server.log('info','Plugins Loaded');
    }
});

server.route(
    [
        {
            method: 'GET',
            path: '/',
            handler:function (req, res) {
                res('<html><body><h1><marquee  behavior="alternate">hi welcome</marquee></h1></body></html>')
            }
        },
        {
            method: 'GET',
            path: '/privacyPolicy',
            handler: function (req, res) {
                privacyPolicy.privacyPolicy(function(err,result){
                    res(result)
                });
            }
        },
        {
            method: 'GET',
            path: '/termsandcondition',
            handler: function (req, res) {
                privacyPolicy.privacyPolicy(function(err,result){
                    res(result)
                });
            }
        }
    ]);
//Bootstrap admin data
bootStrap.bootstrapAdmin(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping admin : ' + err)
    } else {
        console.log(message);
    }
});
//Bootstrap admin data

bootStrap.bootstrapAppVersion(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping admin : ' + err)
    } else {
        console.log(message);
    }
});

server.on('response', function (request) {
    console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() +
        ' ' + request.url.path + ' --> ' + request.response.statusCode);
    console.log('Request payload:', request.payload);
});

//Start Server
server.start(function (err,result) {
    if(err) server.log(err);
    else server.log('info', 'Server running at: ' + server.info.uri);
});
