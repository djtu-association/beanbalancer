// ### check the options format
// check the options of producer's format

var _           = require('lodash'),
    Promise     = require('bluebird'),
    config      = require('../config'),
    errors      = require('./errors');


/**
 * ### check options property
 * check different between options and reference through compare property
 * @param options (object)
 * @param reference (object)
 * @returns {*}
 */
function checkOptionsProperty(options, reference) {

    // get all of keys from connection which is model using for connection format.
    var keys = Object.keys(reference),
        out_of_key;

    for (var i = 0; i < keys.length; i++) {
        if (!options.hasOwnProperty(keys[i])) {
            out_of_key = keys[i];
            break;
        }
    }

    return out_of_key;
}


/**
 * ### normalize path
 * check the type of path and normalize it
 * @param path (string) - the save path of log file
 * @returns {string}
 */
function normalizePath (path) {

    var log_path = '',
        split_paths;

    // check if log is string
    if (!_.isString(path)) {
        throw new errors.ConfigOptionsError('the property of log must be string.');
    }

    // get the split part
    split_paths = path.split('/');

    _.each(split_paths, function (split_path) {
        if (split_path !== '') {
            log_path += split_path + '/';
        }
    });

    return log_path;
}

/**
 * ### check beanstalk connection options format
 * check beanstalk connection options format.
 * it must be object type and must have host,post,id and tube property.
 * @param options (object | array) - connect to beanstalk server options
 * @returns {*}
 */
function checkBeanStalkConnectionOptions (options) {

    // check if options is object or not array.
    // if options is object,change options to array.
    // if options is not array,throw a exception.
    if (_.isPlainObject(options)) {
        options = [options];
    }
    else if (!_.isArray(options)) {
        throw new errors.ConfigOptionsError('Producer connection options must be object or array.');
    }

    // check the format of each options member
    var res = _.map(options, function (option) {
        return new Promise(function (resolve, reject) {

            // check if options is object
            if (!_.isPlainObject(option)) {
                return reject('The connection to beanstalk server must be plain object.');
            }

            // check options has producer property or not
            var out_of_key = checkOptionsProperty (option, config.producer.connection);

            if (!_.isUndefined(out_of_key)) {
                return reject('The connection options must have ' + out_of_key);
            }

            return resolve(option);
        });
    });

    return Promise.all(res).catch(function (eMessage) {
        throw new errors.ConfigOptionsError(eMessage);
    });
}

/**
 * ### check Producer
 * check producer options format
 * @param options (object | array) - connect to beanstalk server options
 * @returns {*}
 */
function checkProducerOptions (options) {

    // Step 1 : check if the option is plain object
    if (!_.isPlainObject(options)) {
        throw new errors.ConfigOptionsError('Producer options must be plain object.');
    }

    // Step 2 : check if the option's property
    var out_of_key = checkOptionsProperty (options, config.producer);

    if (!_.isUndefined(out_of_key)) {
        throw new errors.ConfigOptionsError('Producer options must have ' + out_of_key + ' property.');
    }

    // Step 3 : check connection options
    return checkBeanStalkConnectionOptions(options.connection).then(function (res) {

        // Step 4 : normalize log path
        options.connection = res;
        options.log = normalizePath(options.log);

        return options;
    });
}

module.exports = {
    checkProducerOptions : checkProducerOptions
};