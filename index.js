var WSServer = require("ws").Server;
var events = require("events");
var util = require("util");

//Request {
	function Request(sock, data, requestId) {
		this.data = data;

		this._sock = sock;
		this._requestId = requestId;
		this._replied = false;
	}

	Request.prototype.reply = function(data) {
		if (this._replied)
			throw new Error("Already replied.");

		this._sock._send({
			r: this._requestId,
			d: data
		});

		this._replied = true;
	}

	Request.prototype.error = function(msg) {
		if (this._replied)
			throw new Error("Already replied.");

		this._sock._send({
			r: this._requestId,
			err: msg
		});

		this._replied = true;
	}
//}

//Socket {
	function Socket(websock) {
		this._websock = websock;

		websock.on("message", function(msg) {
			var obj;
			try {
				obj = JSON.parse(msg);
			} catch (err) {
				this.emit("error", err);
			}

			var req = new Request(this, obj.d, obj.r);

			this.emit(obj.n, req);
		}.bind(this));
	}
	util.inherits(Socket, events.EventEmitter);

	//Generic internal send function
	Socket.prototype._send = function(data) {
		this._websock.send(JSON.stringify(data));
	}

	//Trigger event on the client
	Socket.prototype.send = function(name, data) {
		this._send({
			evt: name,
			d: data
		});
	}
//}

//module.exports {
	module.exports = function(options) {
		var wss = new WSServer(options);

		this.socks = [];

		wss.on("connection", function(websock) {
			var sock = new Socket(websock);
			this.socks.push(sock);

			this.emit("connection", sock);
		}.bind(this));
	}
	util.inherits(module.exports, events.EventEmitter);
//}
