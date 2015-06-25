var Client = require('../');

var BATCH_SIZE = 10000;
var ADDRESS = 'localhost:3000';
var RANDOMIZE = true;
var CONCURRENCY = 5;

var counter = 0;
setInterval(function () {
  console.log(counter*BATCH_SIZE+"/s");
  counter = 0;
}, 1000);

var reqs = [];
for(var i=0; i<BATCH_SIZE; ++i) {
  reqs[i] = {
    database: 'test',
    fields: ['a', 'b', 'c', 'd'],
    value: 100,
    count: 10,
  };
}

var client = new Client(ADDRESS);
for(var i=0; i<CONCURRENCY; ++i) {
  send();
}

function send () {
  var now = Date.now() * 1000000;

  for(var i=0; i<BATCH_SIZE; ++i) {
    var req = reqs[i];
    req.timestamp = now;
    if(RANDOMIZE) {
      req.fields[0] = "a" + Math.floor(1000 * Math.random());
      req.fields[1] = "b" + Math.floor(20 * Math.random());
      req.fields[2] = "c" + Math.floor(5 * Math.random());
      req.fields[3] = "d" + Math.floor(10 * Math.random());
    }
  }

  client.putBatch(reqs, function (err, res) {
    if(err) console.error(err);
    counter++;
    send();
  });
}
