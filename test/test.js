/**
 * ### Use for testing bean balance feature
 * Created by wei on 2015/5/21.
 */

var _               = require('lodash'),
    Promise         = require('bluebird'),
    should          = require('should'),

    logger          = require('../lib/logger'),
    producer        = require('../lib/producer'),
    consumer        = require('../lib/consumer'),
    errors           = require('../lib/errors');


describe('BeanBalancer', function () {

    describe('Producer', function () {

        describe('init', function () {

            it('fails init for not plain object.', function () {
                var options = 123,
                    message = 'Producer options must be plain object.';

                producer.init.bind(producer, options).should.throw(errors.ConfigOptionsError);
                producer.init.bind(producer, options).should.throw(message);
            });

            it('fails init for lack of necessary property', function () {
                var options = {},
                    message = 'Producer options must have connection property.';

                producer.init.bind(producer, options).should.throw(errors.ConfigOptionsError);
                producer.init.bind(producer, options).should.throw(message);
            });

            it('fails init for incorrect type of connection', function () {
                var options = {connection: 1, log: 1},
                    message = 'Producer connection options must be object or array.';

                producer.init.bind(producer, options).should.throw(errors.ConfigOptionsError);
                producer.init.bind(producer, options).should.throw(message);
            });


            it('fails init for lack of necessary property that belong connection', function () {
                var options = {connection: {}, log: 1},
                    message = 'The connection options must have host property.';

                producer.init(options).catch(function (err) {
                    err.message.should.equal(message);
                });

                // TODO : Why we can't use this function to check type of error
                // TODO : Why it is an unhandled Error?
                //producer.init.bind(producer, options).should.throw(errors.ConfigOptionsError);
                //producer.init.bind(producer, options).should.throw(message);
            });
        })

    })

});

