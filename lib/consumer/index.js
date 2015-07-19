// ### fivebeans
// connect to beanstalkd server
// init fivebeans clients and workers by options

var _                = require('lodash'),
    Promise         = require('bluebird'),
    fivebeans       = require('fivebeans-icollege'),
    data            = require('../data'),
    logger          = require('../logger'),
    handler         = require('./handler'),
    errors          = require('../errors'),
    config          = require('../../config'),

    // private
    workers;

/**
 * ### init consumer
 * connect to specific beanstalk server correctly
 * init array each element including client and worker dueling with read and write stream
 * @returns {*}
 */
function initConsumer() {

    // init worker handler
    var options = config.consumer;
        handler = handler();

    // step 1 : init consumer logger
    logger.initConsumerLogger();

    // step 2 : init database
    return data.init(options.db).then(function () {

        // step 3 : init workers
        var connections = options.beanstalk.connection;

        // change object into array
        if (_.isPlainObject(connections)) {
            connections = [connections];
        }
        else if (!_.isArray(connections)) {
            throw new errors.ConsumerError('the type of connection which belong to beanstalk must be object or array');
        }

        workers = _.map(connections, function (connection) {
            connection.handlers = {};
            connection.handlers[handler.type] = handler;
            return initWorker(connection);
        });

        return Promise.all(workers);

    }).catch (function (err) {
        throw new errors.ConsumerError(err);
    });
}

/**
 * ### init fivebeans worker
 * create worker dueling with reading data stream from beanstalkd
 * @param options
 * @returns {Promise}
 */
function initWorker(options) {
    return new Promise(function (reslove, reject) {

        var worker = new fivebeans.worker(options);

        worker.on('started', function () {

            worker.client.use(options.tube, function (err) {
                if (err) {
                    return reject(err);
                }
                else {
                    // finish i nit function when receiving connect event
                    logger.infoLog(logger.category.info, 'Connect to ' + options.host + ':' + options.port + ' beanstalkd server');
                    reslove(worker);
                }
            })

        }).on('error', function (err) {

            return reject(err);

        }).on('close', function () {

            // TODO : What should we do when beanstalkd connection closed.
            logger.infoLog(logger.category.info, 'Close connection from beanstalk');

        }).on('warning', function (payload) {

            logger.warnLog(logger.category.trouble, payload.message + ':' + payload.error);

        }).on('info', function (payload) {

            logger.infoLog(logger.category.info, payload.message);

        });

        worker.start([options.tube]);
    });
}



module.exports = {
    initConsumer : initConsumer
};