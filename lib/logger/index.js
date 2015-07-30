// ### Logger
// init logger and record event state into file

var _                =  require('lodash'),
    Promise          = require('bluebird'),
    log4js           = require('log4js'),
    config           = require('../../config'),
    logger;

logger = {

    // logger array contains all of logger instance
    logs : [],

    category : [],

    /**
     * ### init consumer logger
     * init consumer logger attribute through config.logger
     */
    initConsumerLogger : function () {

        var self = this,
            options = config.logger,
            appenders = [];

        // get all of category attribute name
        var keys = _.keys(options.category);

        // create appender object through the value of keys
        _.each (keys, function (key) {

            var appender = _.clone(options.appender);
            appender.filename = appender.filename + key + '.log';
            appender.category = key;
            appender.level = options.category[key];

            self.category[key] = key;

            appenders.push(appender);
        });

        // init log instance
        log4js.configure({'appenders' : appenders});

        // get all of appender instances
        _.each(appenders, function (appender) {
            var category = appender.category;
            self.logs[category] = log4js.getLogger(category);
            self.logs[category].setLevel(appender.level);
        });
    },

    /**
     * ### init producer logger
     * init producer logger attribute through config.logger
     * @param path (string) - the save path of logger file
     */
    initProducerLogger : function (path) {

        var appender = _.clone(config.logger.appender),
            category = 'log';

        appender.filename = path + 'logger.log';
        appender.category = category;

        this.category[category] = category;

        log4js.configure({'appenders' : [appender]});

        this.logs[category] = log4js.getLogger(category);
        this.logs[category].setLevel('INFO');
    },

    traceLog : function (category, message) {
        this.logs[category].trace(message);
    },

    debugLog : function (category, message) {
        this.logs[category].debug(message);
    },

    infoLog : function (category, message) {

        this.logs[category].info(message);
    },

    warnLog : function (category, message) {
        this.logs[category].warn(message);
    },

    errorLog : function (category, message) {
        this.logs[category].error(message);
    },

    fatalLog : function (category, message) {
        this.logs[category].fatal(message);
    }
};



module.exports = logger;