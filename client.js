(function() {
	function SockSugar(url) {
		this._sock = new WebSocket(url);
		this._cbs = {};
		this._reqs = [];
		this._requestId = 1;

		this._sock.onopen = function() {
			this.emit("ready");
		}.bind(this);

		this._sock.onmessage = function(evt) {
			var obj = JSON.parse(evt.data);

			if (obj.err) {
				this._reqs[obj.r](obj.err);
			} else if (obj.r) {
				this._reqs[obj.r](null, obj.d);
			} else if (obj.evt) {
				this.emit(obj.evt, obj.d);
			} else {
				throw new Error("Invalid message.");
			}

			delete this._reqs[obj.r];
		}.bind(this);
	}

	SockSugar.prototype.send = function(name, data, cb) {
		this._reqs[this._requestId] = cb;

		this._sock.send(JSON.stringify({
			r: this._requestId++,
			d: data,
			n: name
		}));
	}

	SockSugar.prototype.on = function(name, func) {
		if (this._cbs[name] === undefined)
			this._cbs[name] = [];

		this._cbs[name].push(func);
	}

	SockSugar.prototype.emit = function(name, data) {
		if (this._cbs[name] === undefined)
			return;

		this._cbs[name].forEach(function(cb) {
			cb(data);
		});
	}

	window.SockSugar = SockSugar;
})();
