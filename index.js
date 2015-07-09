var path = require('path');
var srpc = require('simple-rpc');
var util = require('util');
var events = require('events');
var proto = require('./protocol');

//   CLIENT
// ----------

function Client (address) {
  events.EventEmitter.call(this);

  this.config = {
    reconnect: {timeout: 5000},
  };

  this._address = address;
  this._client = new srpc.Client(address);

  this.__onerror = this._onerror.bind(this);
  this.__onclose = this._onclose.bind(this);
  this.__reconnect = this._reconnect.bind(this);

  this._reconnectTimer = null;
  this._closedByUser = false;
}

// Client emits: ['error', 'connect']
util.inherits(Client, events.EventEmitter);

Client.prototype.connect = function(callback) {
  var self = this;

  this._client.removeListener('error', this.__onerror);
  this._client.removeListener('close', this.__onclose);
  this._client.once('error', callback);
  this._client.connect(function (err) {
    self._client.removeListener('error', callback);
    self._client.on('error', self.__onerror);
    self._client.on('close', self.__onclose);
    callback(err);
  });
};

Client.prototype.info = function(callback) {
  var enc = proto.InfoReq;
  var dec = proto.InfoRes;
  var buffer = enc.encode({}).toBuffer();

  this._client.call('info', buffer, function (err, data) {
    if(err) {
      callback(err);
      return;
    }

    var res = dec.decode(data);
    callback(null, res);
  });
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

Client.prototype.close = function(reqs, callback) {
  this._closedByUser = true;
  if(this._reconnectTimer) {
    clearTimeout(this._reconnectTimer);
  }

  this._client.close();
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

Client.prototype._reconnect = function() {
  var self = this;

  console.error('kmdb: reconnecting');
  this._client.connect(function (err) {
    if(!err) {
      console.error('kmdb: reconnected');
      self.emit('connect');
      return;
    }

    console.error('kmdb: reconnect failed: ', err);

    if(self._reconnectTimer) {
      clearTimeout(self._reconnectTimer);
    }

    if(!self._closedByUser) {
      var timeout = self.config.reconnect.timeout;
      self._reconnectTimer = setTimeout(self.__reconnect, timeout);
    }
  });
};

Client.prototype._onerror = function(err) {
  console.error('kmdb: error', err);
  this.emit('error', err);
};

Client.prototype._onclose = function() {
  if(this._reconnectTimer) {
    clearTimeout(this._reconnectTimer);
  }

  if(!this._closedByUser) {
    console.error('kmdb: connection lost');
    var timeout = this.config.reconnect.timeout;
    this._reconnectTimer = setTimeout(this.__reconnect, timeout);
  }
};

module.exports = Client;
