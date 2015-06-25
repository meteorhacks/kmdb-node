var path = require('path');
var grpc = require('grpc');
var kmdb = grpc.load(__dirname + '/protocol.proto').kmdb;

//   CLIENT
// ----------

function Client (address) {
  this.address = address;
  this.service = new kmdb.DatabaseService(address);
}

Client.prototype.put = function(req, callback) {
  this.service.put(req, callback);
};

Client.prototype.putBatch = function(reqs, callback) {
  var batch = {batch: reqs};
  this.service.putBatch(batch, callback);
};

Client.prototype.inc = function(req, callback) {
  this.service.inc(req, callback);
};

Client.prototype.incBatch = function(reqs, callback) {
  var batch = {batch: reqs};
  this.service.incBatch(batch, callback);
};

Client.prototype.get = function(req, callback) {
  this.service.get(req, callback);
};

Client.prototype.getBatch = function(reqs, callback) {
  var batch = {batch: reqs};
  this.service.getBatch(batch, callback);
};

module.exports = Client;
