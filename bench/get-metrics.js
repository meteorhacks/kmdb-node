var Client = require('../');

var BATCH_SIZE = 10;
var ADDRESS = 'srpc://localhost:3000';
var RANDOMIZE = true;
var CONCURRENCY = 5;
var DURATION = 3600000000000;
var INDEX_FIND = true;
var GROUP_DATA = true;

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
    groupBy: [true, true, true, true],
  };

  if(INDEX_FIND) {
    reqs[i].fields[3] = '';
  }

  if(GROUP_DATA) {
    reqs[i].groupBy[3] = false;
  }
}

var client = new Client(ADDRESS);
client.connect(function (err) {
  if(err) {
    console.error(err);
    return;
  }

  for(var i=0; i<CONCURRENCY; ++i) {
    send();
  }
});

function send () {
  var ts2 = Date.now() * 1000000;
  var ts1 = ts2 - DURATION;

  for(var i=0; i<BATCH_SIZE; ++i) {
    var req = reqs[i];
    req.startTime = ts1;
    req.endTime = ts2;
    if(RANDOMIZE) {
      req.fields[0] = "a" + Math.floor(1000 * Math.random());
      req.fields[1] = "b" + Math.floor(20 * Math.random());
      req.fields[2] = "c" + Math.floor(5 * Math.random());

      if(INDEX_FIND) {
        req.fields[3] = ''
      } else {
        req.fields[3] = "d" + Math.floor(10 * Math.random());
      }
    }
  }

  client.get(reqs, function (err, res) {
    if(err) console.error(err);
    counter++;
    send();
  });
}
