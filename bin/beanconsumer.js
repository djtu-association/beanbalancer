// # beanstalk consumer
// pull data from beanstalk server and store it into mongodb

var consumer        = require('../lib/consumer');

consumer.initConsumer().then(function () {
    console.log('consumer start.......');
    console.log('please check the files from ./content to know more detail.');
});