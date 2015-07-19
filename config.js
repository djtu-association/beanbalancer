// # BeanBalancer Configuration
// Setup your BeanBalancer's database environments

// private
var _                   = require('lodash'),

    // public
    config;

config = {

    logger : {

        category : {
            trouble: 'WARN',
            data: 'INFO',
            info: 'INFO'
        },

        appender : {
            type: 'dateFile',
            filename: '../content/',
            pattern: "-yyyy-MM-dd.log",
            alwaysIncludePattern: false
        }
    },




    // producer connection model
    // this property don't use connect beanstalk server
    // just a model for check format in lib/config.js
    producer : {
        connection : {
            host: '42.96.195.83',
            post: '11300',
            // the tube using for put data
            tube: 'fivebeans'
        },
        log : '../temp/logs/'
    },

    // consumer connection
    // it use for connecting beanstalk server as a read stream
    consumer : {

        db : {
            key: 'mongodb',
            connection: {
                host: '127.0.0.1',
                port: '27017',
                database: 'icollege'
            }
        },

        beanstalk: {
            connection : [{
                id: 'FFB',
                host: '42.96.195.83',
                port: '11300',
                ignoreDefault: false,
                timeout: 1,
                tube: 'fivebeans'
            }, {
                id: 'SFB',
                host: '42.96.195.83',
                port: '11300',
                ignoreDefault: false,
                timeout: 1,
                tube: 'test'
            }]
        }
    },

    // the value of beginning store data into database.
    threshold: 10
};

// Export config
module.exports = config;