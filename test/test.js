/**
 * ### Use for testing bean balance feature
 * Created by wei on 2015/5/21.
 */

var should = require('should'),
    testIndex = require('../index');

describe('test mocha and should feature!', function () {
    it ('test', function () {
        var testString = testIndex.test();
        testString.should.equal('Test mocha frame.');
    });
});

