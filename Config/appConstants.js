
const SERVER = {
    APP_NAME: 'vipcart App',
    JWT_SECRET_KEY: 'MaEHqzXzdWrCS6TS',
    MAX_DISTANCE_RADIUS_TO_SEARCH : 1000000000,
    THUMB_WIDTH : 50,
    paymentCount : 100,
    THUMB_HEIGHT : 50,
    TAX:0.18
};


const DATABASE = {
    PROFILE_PIC_PREFIX : {
        ORIGINAL : 'Pic_',
        THUMB : 'Thumb_'
    },
    DEVICE_TYPES: {
        IOS: 'IOS',
        ANDROID: 'ANDROID'
    },
    USER_TYPE: {
        ADMIN: 'ADMIN',
        USER: 'USER',
        DRIVER: 'DRIVER',
        SUPPLIER : 'SUPPLIER'
    },
    VEHICLE_TYPE: {
        CONVERTIBLE: 1,
        NORMAL: 2
    },
    VEHICLE_GROUP: {
        LUXURY: 1,
        MINI: 2,
        SUPERCAR: 3,
        SUV: 4,
        VINTAGE: 5
    },

    TYPE : {
      LOVEIT : 0,
      PASSIT :1,
      SHARE :2,
      FAVOURITEIDEA : 3,
      FAVOURITEPEOPLE : 4
    },
    SHARE_ON : {
        FACEBOOK : 0,
        TWITTER :1,
        TEXT_EMAIL :2,
        OTHERS : 3
    },

    STATUS_TYPES:{
        PENDING:'PENDING',
        PROGRESS:'PROGRESS',
        DELIVERED:'DELIVERED',
        ACCEPT:'ACCEPT',
        USERRATE:'USERRATE',
        SUPPLIERRATE:'SUPPLIERRATE',
        COMPLETE:'COMPLETE',
        CANCEL:'CANCEL',
        ENROUTE:'ENROUTE',
        START:'START',
        ACTIVE:1,
        ARCHIVED:2,
        DELETED:3
    },
    PAYMENT_OPTIONS : {
        CREDIT_CARD : 1,
        DEBIT_CARD : 2,
        PAYPAL : 4,
        CASH : 3
    },
    PICKUP_TYPE : {
        MYADDRESS : 1,
        SUPPLIER : 2,
        AIRPORT : 3,
    },
    MSG_TYPE : {
        TEXT : 1,
        IMAGE : 2,
    }
};



const STATUS_MSG = {
    ERROR: {
        TOKEN_EXPIRED: {
            statusCode:401,
            customMessage : 'Sorry, your account has been logged in other device! Please login again to continue.',
            type : 'TOKEN_ALREADY_EXPIRED'
        },
        BLOCKED: {
            statusCode:405,
            customMessage : 'This account is blocked by Admin. Please contact support team to activate your account.',
            type : 'BLOCKED'
        },
        DB_ERROR: {
            statusCode:400,
            customMessage : 'DB Error : ',
            type : 'DB_ERROR'
        },
        INVALID_PASSWORD: {
            statusCode:400,
            customMessage : 'Password you have entered does not match.',
            type : 'INVALID_PASSWORD'
        },
        ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Email address you have entered is already registered with us.',
            type : 'ALREADY_EXIST'
        },
        SUPPLIER_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Email address you have entered is already registered with supplier.',
            type : 'SUPPLIER_ALREADY_EXIST'
        },
        IMP_ERROR: {
            statusCode:500,
            customMessage : 'Implementation error',
            type : 'IMP_ERROR'
        },
        APP_ERROR: {
            statusCode:400,
            customMessage : 'Application Error',
            type : 'APP_ERROR'
        },
        INVALID_ID: {
            statusCode:400,
            customMessage : 'Invalid Id Provided : ',
            type : 'INVALID_ID'
        },
        DUPLICATE: {
            statusCode:400,
            customMessage : 'Duplicate Entry',
            type : 'DUPLICATE'
        },
        INVALID_EMAIL: {
            statusCode:400,
            customMessage : 'The email address you have entered does not match.',
            type : 'INVALID_EMAIL'
        },
        INVALID_TOKEN: {
            statusCode:400,
            customMessage : 'The token you have entered does not match.',
            type : 'INVALID_TOKEN'
        },
        SAME_PASSWORD: {
            statusCode:400,
            customMessage : 'Old password and new password can\'t be same',
            type : 'SAME_PASSWORD'
        },
        INCORRECT_OLD_PASSWORD: {
            statusCode:400,
            customMessage : 'Old password you have entered does not match.',
            type : 'INCORRECT_OLD_PASSWORD'
        },
        SOCIAL_LOGIN: {
            statusCode:400,
            customMessage : 'You are login with social platform, hence not able to use this option.',
            type : 'SOCIAL_LOGIN'
        },
},
    SUCCESS : {
        CREATED: {
            statusCode:200,
            customMessage : 'Created Successfully',
            type : 'CREATED'
        },
        DEFAULT: {
            statusCode:200,
            customMessage : 'Success',
            type : 'DEFAULT'
        },
        UPDATED: {
            statusCode:200,
            customMessage : 'Updated Successfully',
            type : 'UPDATED'
        },
        LOGOUT: {
            statusCode:200,
            customMessage : 'Logged Out Successfully',
            type : 'LOGOUT'
        },
        DELETED: {
            statusCode:200,
            customMessage : 'Deleted Successfully',
            type : 'DELETED'
        },
        REGISTER: {
            statusCode:200,
            customMessage : 'Register Successfully',
            type : 'REGISTER'
        }
    }
};

const swaggerDefaultResponseMessages = {
    '200': {'description': 'Success'},
    '400': {'description': 'Bad Request'},
    '401': {'description': 'Unauthorized'},
    '404': {'description': 'Data Not Found'},
    '500': {'description': 'Internal Server Error'}
};




let APP_CONSTANTS = {
    SERVER: SERVER,
    DATABASE: DATABASE,
    STATUS_MSG: STATUS_MSG,
    swaggerDefaultResponseMessages: swaggerDefaultResponseMessages,
};



module.exports = APP_CONSTANTS;
