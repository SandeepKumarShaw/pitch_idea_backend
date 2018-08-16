'use strict';

let Good = require('good');

//Register Good Console


exports.register = function(server, options1, next){

    server.register({
        register:Good,
        options: options
    }, function (err) {
        if (err) {
            throw err;
        }
    });

    next();
};

const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout']
    }
};
exports.register.attributes = {
    name: 'good-console-plugin'
};