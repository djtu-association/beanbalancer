var _               = require('lodash'),
    db               = require('../data'),
    config          = require('../../config');

/**
 * ### the worker handler
 * @constructor
 */
function DataHandler()
{
    // the type of handler
    this.type = 'data';

    // the value of beginning store data into database.
    this.threshold = config.threshold;

    // It is object of getting data from beanstalk server.
    // Each type of element in the data is array.
    // the data will be save into database when the length of element is greater than threshold that come from config
    this.data = {};
}

// This is an extremely silly kind of job.
DataHandler.prototype.work = function(payload, callback)
{
    // check if data has property of collection name or not.
    this.data[payload.collectionName] = this.data[payload.collectionName] || [];

    this.data[payload.collectionName].push(payload.docs);

    if (this.data[payload.collectionName].length >= this.threshold) {
        var data = this.data[payload.collectionName].splice(0, this.threshold);
        db.store(payload.collectionName, data);
    }

    callback('success');
};

module.exports = function () {
    return new DataHandler();
}