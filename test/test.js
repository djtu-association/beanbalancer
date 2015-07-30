/**
 * ### Use for testing bean balance feature
 * Created by wei on 2015/5/21.
 */

var _               = require('lodash'),
    Promise         = require('bluebird'),
    sinon            = require('sinon'),
    should          = require('should'),

    config          = require('../lib/config'),
    logger          = require('../lib/logger'),
    producer        = require('../lib/producer'),
    consumer        = require('../lib/consumer'),
    DB               = require('../lib/data'),
    handler         = require('../lib/consumer/handler'),

    sandbox          = sinon.sandbox.create();


var connections = [{
    id: 'SFB',
    host : '42.96.195.83',
    port : 11300,
    ignoreDefault: false,
    timeout: 1,
    tube : 'fivebeans'
}, {
    id: 'SFB',
    host : '42.96.195.83',
    port : 11300,
    ignoreDefault: false,
    timeout: 1,
    tube : 'test'
}];

var inconnection = {
    host : '127.0.0.1',
    port : '11300',
    tube : 'testtube'
};

var log = './content',
    collection = 'fivebeans-test',
    push_data = {num : 12};

var db_connection = {
    key : 'mongodb',
    connection : {}
}

describe('BeanBalancer', function () {

    describe('Producer', function () {

        describe('Check Options', function () {

            it('fails init for not plain object.', function (done) {
                var options = 123,
                    message = 'Producer options must be plain object.';

                config.checkProducerOptions(options).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            it('fails init for lack of necessary property', function (done) {
                var options = {},
                    message = 'Producer options must have connection property.';

                config.checkProducerOptions(options).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            it('fails init for incorrect type of connection', function (done) {
                var options = {connection: 1, log: 1},
                    message = 'Producer connection options must be object or array.';

                config.checkProducerOptions(options).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            it('fails init for the member of connection is not plain object.', function (done) {
                var options = {connection: [1], log: 1},
                    message = 'The connection to beanstalk server must be plain object.';

                config.checkProducerOptions(options).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            it('fails init for lack of necessary property that belong to connection', function (done) {
                var options = {connection: {}, log: 1},
                    message = 'The connection options must have host property.';

                config.checkProducerOptions(options).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            it('init successfully', function (done) {
                var options = {connection: connections[0], log: log};

                config.checkProducerOptions(options).then(function (ops) {
                    options.connection = [options.connection];
                    ops.should.equal(options);
                    done();
                });

            });
        });

        describe('Init', function () {

            after(function (done) {
                producer.quit().then(done);
            })

            afterEach(function () {
                logger.logs.splice(0, logger.logs.length);
                logger.category.splice(0, logger.category.length);
            });

            it ('fails init for in existence connection', function (done) {
                var message = 'connect ECONNREFUSED';

                producer.init({connection : inconnection, log : log}).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            //it ('fails init for in existence folder', function (done) {
            //    var path = './t',
            //        message = 'ENOENT, open \'H:\\Work\\BeanBalancer\\t\\logger.log\'';
            //
            //    process.once('uncaughtException', function (e) {
            //        console.log(e.message);
            //        e.message.should.equal(message);
            //        done();
            //    });
            //
            //    producer.init({connection : connections, log : path}).catch(function (e) {
            //        console.log(e);
            //        done();
            //    });
            //});

            it('init successfully', function (done) {

                producer.init({connection : connections, log : log}).then(function () {
                    producer.getClients().length.should.equal(connections.length);
                    done();
                });
            });
        });

        describe('Push Data', function () {

            // waiting for quitting connection
            after(function (done) {
                producer.quit().then(done);
            })

            it ('push data fails for unreasonable parameter', function (done) {
                var message = 'the value of collectionName and docs must exist.';

                producer.pushData().catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            it ('push data fails for do not init at first', function (done) {
                var message = 'init producer at first.';

                producer.pushData('test', push_data).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                });
            });

            it('push data successful', function (done) {
                producer.init({connection : connections, log : log}).then(function () {
                    return producer.pushData(collection, push_data);
                }).then(function (jobId) {
                    jobId.should.exist;
                    jobId.should.is_long;
                    done();
                });
            })

        });

    });

    describe('Consumer', function () {

        describe('Handler', function () {

            it('check property of handler', function () {

                var hd = handler();

                hd.work.should.isFunction;
                hd.type.should.equal('data');
                hd.threshold.should.equal(10);
                hd.data.should.isPlainObject;
            });

        });

        describe('Database', function () {

            describe('Init', function () {

                before(function () {
                    logger.initConsumerLogger();
                });

                after(function (done) {
                    DB.close().then(function () {
                        done();
                    });
                });

                it('init fails for different database type', function (done) {
                    var options = {key : ''},
                        message = 'Sorry~!This version of beanbalancer support mongodb database only.';

                    DB.init(options).catch(function (e) {
                        e.message.should.equal(message);
                        done();
                    })
                });

                it('init fails for in existence database connection', function (done) {
                    var options = {key : 'mongodb', connection : {host : '127.0.0.1', port : '27013'}},
                        message = 'Fail to connect database.';

                    DB.init(options).catch(function (e) {
                        e.message.should.equal(message);
                        done();
                    })
                });

                it('connect database successfully', function (done) {
                    var options = {key : 'mongodb', connection : {}};

                    DB.init(options).then(function (database) {

                        var host = '127.0.0.1',
                            port = 27017,
                            name = 'beanbalancer-test';

                        database.db.should.exist;
                        database.db.s.topology.host.should.equal(host);
                        database.db.s.topology.port.should.equal(port);
                        database.db.s.databaseName.should.equal(name);
                        database.host.should.equal(host);
                        database.port.should.equal(port.toString());
                        database.database.should.equal(name);

                        done();
                    })
                });
            });

            describe('Store', function () {

                after(function (done) {
                    DB.close().then(function () {
                        done();
                    });
                });

                it('store data successfully', function (done) {

                    var data = _.clone(push_data);

                    DB.init(db_connection).then(function () {
                        return DB.store(collection, [data]);
                    }).then(function (res) {
                        res.ops.length.should.equal(1);
                        res.ops[0].should.equal(data);
                        done();
                    });
                })

            });

        });

        describe('Init', function () {

            it('init fails for wrong type of connection', function (done) {
                var options = {
                    beanstalk : {
                        connection : 1
                    },
                    db : db_connection
                },
                    message = 'the type of connection which belong to beanstalk must be object or array.';

                consumer.initConsumer(options).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                })
            });

            it('init fails for in existence beanstalk connection', function (done) {
                var options = {
                        beanstalk : {
                            connection : inconnection
                        },
                        db : db_connection
                    },
                    message = 'connect ECONNREFUSED';

                consumer.initConsumer(options).catch(function (e) {
                    e.message.should.equal(message);
                    done();
                })
            });


            it('init successfully', function (done) {
                var options = {
                        beanstalk : {
                            connection : connections
                        },
                        db : db_connection
                    };

                consumer.initConsumer(options).then(function (workers) {

                    //check the length of workers
                    workers.length.should.equal(connections.length);

                    // set time out and as time goes by
                    // the consumer will pull the data from beanstalk serve
                    // at that time,we should check out the data from beanstalk
                    setTimeout(function () {

                        var datas = workers[0].handlers.data.data[collection],
                            keys = _.keys(push_data);

                        datas.should.isArray;
                        datas.length.should.equal(1);
                        _.each(keys, function (key) {
                            datas[0][key].should.equal(push_data[key]);
                        });
                        done();
                    }, 1000);

                });
            });
        });
    });

    ////describe('Producer and Consumer', function () {
    ////
    ////    it('work together', function (done) {
    ////
    ////        var collection = 'test',
    ////            data = {a : 'test'};
    ////
    ////        producer.init({connection : connections, log : log}).then(function () {
    ////            return producer.pushData(collection, data);
    ////        }).then(function () {
    ////            return consumer.initConsumer({beanstalk : {connection : connections}, db : db_connection});
    ////        }).then(function (workers) {
    ////            workers.length.should.equal(connections.length);
    ////            setTimeout(function () {
    ////                console.log(workers[0].handlers);
    ////                done();
    ////            }, 1200);
    ////        })
    ////    });
    //
    //})

});

