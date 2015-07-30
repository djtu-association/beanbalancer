# Beanbalancer

[![Build Status](https://travis-ci.org/djtu-association/beanbalancer.svg)](https://travis-ci.org/djtu-association/beanbalancer)

Simple and reliable beanstalkd job queue for mongodb or other database.

[Beanstalk Protocol](https://github.com/kr/beanstalkd/blob/master/doc/protocol.md)


our project provide proudcer and consumer module.we can use proudcer module for pushing data to remote beanstalkd server and use consumer module for pulling data back and storing it into database.

at this version of beanbalancer,we choose [bluebird](https://github.com/petkaantonov/bluebird) from multiple Promises/A+ implementation.

## Producer
this module has been exported four functions including init,pushData,quit and getClients.

### init producer
the init function take only one argument.

__options__: init options and it has two property which is connection and log.

    connection: the address of remote beanstalkd server including host,port and tube.its should be a plain 
    object or array.
    log: the path of floder that save logger file.

Here is an example of the init options:

```javascript
var options = {
       connection: [{
               host: '42.96.195.83',
               port: '11300',
               tube: 'fivebeans'
           }, {
               host: '42.96.195.83',
               port: '11301',
               tube: 'fivebeans'
           }
       ],
       log: '../temp/logs/'
  }

```

and Here's an example setting up proudcer:

```javascript
var producer = require('beanbalancer').producer;

producer.init(options).then(function () {...});
```

### push data
the pushData function take two arguments.

__collectionName__: the collection name that save data into database.

__docs__: the content of documents.

we can push data to remote beanstalkd server dispersedly.when we use pushData function,we choose next aim server through rotate load balancing arithmetic and it will return jobId which is the id of data in the server.

```javascript
producer.pushData(collectionName, docs).then(function (jobId) {...});
```

### quit
cut out the connections with beanstalkd server.
```javascript
producer.quit().then(function () {...});
```

### getClients
return clients information.

## Consumer

At this module,you should not rely on our project,because we design consumer module as an independent progress and we haven't exports the consumer module.you must start it by using command line.

Here is an example of the start consumer module.
```bash
1.git clone https://github.com/djtu-association/beanbalancer
2.npm install
3.npm start
```

if you need to change the connection of remote beanstalkd server or database,we suggest you rewrite the value of consumer in the config.js that exist in outermost layer of project.
```javascript

...
consumer : {

        db : {
            key: 'mongodb',
            connection: {
                host: '127.0.0.1',
                port: '27017',
                database: 'icollege'
            }
        },

        beanstalk: {
            connection : [{
                id: 'FFB',
                host: '42.96.195.83',
                port: '11300',
                ignoreDefault: false,
                timeout: 1,
                tube: 'fivebeans'
            }, {
                id: 'SFB',
                host: '42.96.195.83',
                port: '11300',
                ignoreDefault: false,
                timeout: 1,
                tube: 'test'
            }]
        }
    },
...

```

Many thanks!