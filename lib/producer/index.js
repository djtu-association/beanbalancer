// ### Producer Class
// provide uploading data to beanstalk server

var _                 = require('lodash'),
    fivebeans        = require('fivebeans-icollege'),
    Promise          = require('bluebird'),
    config           = require('../config'),
    errors           = require('../errors'),
    logger           = require('../logger'),

    // private
    clients = [],
    //logger,
    initClient,
    loadBalance,

    // public
    init,
    put,
    quit;

var currentClient = 0;

/**
 * ### init fivebeans client
 * connect to beanstalk server through five beans clients
 * @param options (object) - connection setting options
 * @returns {Promise}
 */
initClient = function (options) {
    return new Promise(function (resolve, reject) {

        // create a client instance
        var client = new fivebeans.client(options.host, options.port);

        // monitor 'connect','error' and 'close' event
        client.on('connect', function () {
            // use tube to put data
            client.use(options.tube, function (err) {
                if (err) {
                    // log the error
                    logger.errorLog(logger.category.log, err);
                    return reject(err);
                }

                // logger connection information
                logger.infoLog(logger.category.log, 'connect to beanstalk server whose address is ' + options.host + ':' + options.port);
                logger.infoLog(logger.category.log, 'current tube is ' + options.tube);

                // finish init function when receiving connect event
                client.tube = options.tube;
                resolve(client);
            });

        }).on('error', function (err) {

            return reject(err);

        }).on('close', function (err) {

            if (err) {
                logger.errorLog(logger.category.log, 'fail to close fivebeans clients');
            }

            logger.infoLog(logger.category.log, 'close the connect whose address is ' + options.host + ':' + options.port);

        });

        // start connect to beanstalk server
        client.connect();
    });
}

/**
 * ### init producer
 * @param options (object | array) - init options
 * @returns {*}
 *
 * @example
 * the options' format:
 * it means the beanbalancer connect to two beanstalk server whose address is '42.96.195.83:11300' and '42.96.195.83:11301'
 * var options = {
 *      connection: [{
 *              host: '42.96.195.83',
 *              post: '11300',
 *              // the tube using for put data
 *              tube: 'fivebeans'
 *          }, {
 *              host: '42.96.195.83',
 *              post: '11301',
 *              tube: 'fivebeans'
 *          }
 *      ],
 *      log: '../temp/logs/'
 * }
 */
init = function (options) {

    // step 1 : check options format
    return config.checkProducerOptions(options).then(function (ops) {

        // step 2 : init producer log file
        logger.initProducerLogger(ops.log);

        // notice : the type of ops is array!
        // step 3 : init client through ops
        clients = _.map(ops.connection, function (op) {
            return initClient(op);
        });

        return Promise.all(clients).then(function (cs) {
            clients = cs;
        });

    }).catch(function (err) {
        throw new errors.ProducerError(err.message);
    });

};

/**
 * ### load balance algorithm
 * it is rotate algorithm
 * we get client from clients one by one, and commit put request to client
 * @returns {*}
 */
loadBalance = function () {

    return new Promise(function (resolve, reject) {
        if (0 === clients.length) {
            return reject('Please init producer first.');
        }

        var client =  clients[currentClient];
        currentClient = ++currentClient % clients.length;

        return resolve(client);
    });
}

/**
 * ### put data to server
 * @param job (object)
 */
put = function (collectionName, docs){

    // step 1:choose client to put data
    loadBalance().then(function (client) {

        var job = {
            type: 'data',
            payload: {
                collectionName: collectionName,
                docs: docs
            }
        };

        // step 2: put data
        client.put(0, 0, 60, JSON.stringify(job), function(err, jobID)
        {
            if (err) {
                logger.errorLog(logger.category.log, 'it is fail that request putting data to server.');
                logger.errorLog(logger.category.log, job);
            }
        });

    }).catch(function (eMessage) {
        throw new errors.ProducerError(eMessage);
    });

}

/**
 * ### quit producer
 * simply closes the beanstalk connection.
 */
quit = function () {

    _.each(clients, function (client) {
        client.quit();
    });
}

module.exports = {
    init: init,
    put: put,
    quit: quit
}
