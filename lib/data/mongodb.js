// ### mongodb database
// realize mongodb database's connection and insertion

var Promise         = require('bluebird'),
    MongoClient     = require('mongodb').MongoClient;

var DEFAULT_HOST = '127.0.0.1',
    DEFAULT_PORT = '27017',
    DEFAULT_DATABASE = 'beanbalancer-test',
    // options settings of storing data
    options = {};

/**
 * Mongodb Class
 * @constructor
 */
Mongodb = function Mongodb(connection, options) {

    //mongodb
    this.db = {};

    // db connection host
    this.host = connection.host || DEFAULT_HOST;

    // db connection port
    this.port = connection.port || DEFAULT_PORT;

    // db connection database name
    this.database = connection.database || DEFAULT_DATABASE;

    // db connection optional settings
    this.options = options || {};
}

/**
 * ### connect to mongodb
 * create mongodb connection
 * @returns {*}
 */
Mongodb.prototype.connect = function () {

    //generate string of mongodb connection url.
    var self = this,
        url = 'mongodb://' + self.host + ':' + self.port + '/' + self.database;

    return new Promise(function (reslove, reject) {
        MongoClient.connect(url, self.options, function (err, db) {
            if (err) {
                return reject(err);
            }

            //set db prototype
            self.db = db;
            reslove(self);
        })
    })
}

/**
 * ### Store docs into database
 * store an array of documents into collection.
 * @param collectionName (string) – the collection name we wish to update documents.
 * @param docs (Array) – the content of documents
 * @returns {*}
 */
Mongodb.prototype.store = function (collectionName, docs) {
    var collection = this.db.collection(collectionName);

    return new Promise(function (resolve, reject) {
        collection.insertMany(docs, options, function(err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

/**
 * ### close database
 * close database
 * @returns {Promise}
 */
Mongodb.prototype.close = function () {

    var self = this;

    return new Promise(function (resolve, reject) {
        self.db.close(false, function (err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });

}

module.exports = Mongodb;