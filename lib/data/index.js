// ### beanbalancer database
// connected correctly to specific database server depending on key
// at this version,we support mongodb database only.

var Promise    = require('bluebird'),
    errors      = require('../errors'),
    logger      = require('../logger'),
    Mongodb     = require('./mongodb'),
    config      = require('../../config'),
    database,
    db;

db = {
    /**
     * ### Connect to database
     * connect correctly to specific database server depending on key
     * @param options (object) - db connection optional settings
     * @returns {*}
     */
    init : function (options) {

        // check the value of key creating specific database object
        if (options.key === 'mongodb') {
            database = new Mongodb(options.connection, options.options);
        }
        else {
            return Promise.reject(new errors.DatabaseError('Sorry~!This version of beanbalancer support mongodb database only.'));
        }

        // connect to database server
        return database.connect().catch(function () {
            return Promise.reject(new errors.DatabaseError('Fail to connect database.'));
        });
    },

    /**
     * ### Store data
     * store data into database
     * @param collectionName (string) - the collection name we wish to update documents.
     * @param docs (array) - the content of documents
     * @returns {*}
     */
    store : function (collectionName, docs) {

        return database.store(collectionName, docs).then(function (res) {
            logger.infoLog(logger.category.data, res.ops);
            return res;
        }, function (err) {
            logger.errorLog(logger.category.trouble, err);
        });
    },

    /**
     * ### Close database
     * close database connection
     * @returns {*}
     */
    close : function () {
        return database.close().then(function () {
            logger.infoLog(logger.category.info, 'close database');
        }, function (err) {
            logger.errorLog(logger.category.trouble, err);
        });
    }
}

module.exports = db;