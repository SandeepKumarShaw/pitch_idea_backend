
'use strict';

if (process.env.NODE_ENV === 'dev') {
    exports.config = {
        PORT : 8000,
        dbURI : 'mongodb://pitchideaDev:cKFpCAuZa6D5QXkh@35.164.196.55/pitchideaDev'
    }
} else if (process.env.NODE_ENV === 'test') {
    exports.config = {
        PORT : 8001,
        dbURI : 'mongodb://pitchideaTest:cKFpCAuZa6D5QXkh@35.164.196.55/pitchideaTest'
    }
} else if (process.env.NODE_ENV === 'live') {
    exports.config = {
        PORT : 8081,
        dbURI : 'mongodb://pitchideaLive:cKFpCAuZa6D5QXkh@35.164.196.55/pitchideaLive'
    }
}
else {
    exports.config = {
        PORT : 8081,
        dbURI : 'mongodb://localhost/pitchidea'
    };
}