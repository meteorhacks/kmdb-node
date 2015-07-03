var path = require('path');
var srpc = require('simple-rpc');
var proto = require('./protocol');

//   CLIENT
// ----------

function Client (address) {
  this._address = address;
  this._client = new srpc.Client(address);
  this._client.on('error', this._onError.bind(this));
}

Client.prototype.connect = function(callback) {
  this._client.connect(callback);
};

Client.prototype.put = function(reqs, callback) {
  this._call('put', reqs, proto.PutReqBatch, proto.PutResBatch, callback);
};

Client.prototype.inc = function(reqs, callback) {
  this._call('inc', reqs, proto.IncReqBatch, proto.IncResBatch, callback);
};

Client.prototype.get = function(reqs, callback) {
  this._call('get', reqs, proto.GetReqBatch, proto.GetResBatch, callback);
};

Client.prototype._call = function(method, reqs, enc, dec, callback) {
  var batch = {batch: reqs};
  var buffer = enc.encode(batch).toBuffer();

  this._client.call(method, buffer, function (err, data) {
    if(err) {
      callback(err);
      return;
    }

    var res = dec.decode(data);
    callback(null, res);
  });
};

Client.prototype._onError = function(err) {
  console.error(err);
  this._client.connect();
};

module.exports = Client;
