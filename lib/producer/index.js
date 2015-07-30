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
    getClients,
    pushData,
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
                    return reject(new errors.ProducerError(err.message));
                }

                // logger connection information
                logger.infoLog(logger.category.log, 'connect to beanstalk server whose address is ' + options.host + ':' + options.port);
                logger.infoLog(logger.category.log, 'current tube is ' + options.tube);

                // finish init function when receiving connect event
                client.tube = options.tube;
                resolve(client);
            });

        }).on('error', function (err) {

            return reject(new errors.ProducerError(err.message));

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
 *              port: '11300',
 *              // the tube using for put data
 *              tube: 'fivebeans'
 *          }, {
 *              host: '42.96.195.83',
 *              port: '11301',
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

    });

};

getClients = function () {
    return clients;
}

/**
 * ### load balance algorithm
 * it is rotate algorithm
 * we get client from clients one by one, and commit put request to client
 * @returns {*}
 */
loadBalance = function () {

    return new Promise(function (resolve, reject) {
        if (0 === clients.length) {
            return reject(new errors.ProducerError('init producer at first.'));
        }

        var client =  clients[currentClient];
        currentClient = ++currentClient % clients.length;

        return resolve(client);
    });
}

/**
 * ### push data to server
 * push data to beanstalk server
 * @param collectionName (string) - collection name
 * @param docs (object) - the content of documents
 * @returns {*}
 */
pushData = function (collectionName, docs){

    // step 1 : check if the value of colletionName and docs exist
    if (_.isUndefined(collectionName) || _.isUndefined(docs)) {
        return Promise.reject(new errors.ProducerError('the value of collectionName and docs must exist.'));
    }

    // step 2 : choose client to put data
    return loadBalance().then(function (client) {

        var data = {
            type: 'data',
            payload: {
                collectionName: collectionName,
                docs: docs
            }
        };

        // step 3 : put data
        return new Promise(function (resolve) {
            client.put(0, 0, 60, JSON.stringify(data), function(err, jobId)
            {
                if (err) {
                    logger.errorLog(logger.category.log, 'it is fail that request putting data to server.');
                    logger.errorLog(logger.category.log, data);
                }

                return resolve(jobId);
            });
        });
    });

}

/**
 * ### quit producer
 * simply closes the beanstalk connection.
 */
quit = function () {

    return new Promise(function (resolve) {

        // the time of ending up
        var time = 50 * clients.length;

        _.each(clients, function(client) {
            client.quit();
        });

        currentClient = 0;
        clients.splice(0, clients.length);

        setTimeout(function () {
            return resolve();
        }, time);
    })




}

module.exports = {
    init: init,
    getClients: getClients,
    pushData: pushData,
    quit: quit
}
