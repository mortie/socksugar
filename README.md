# SockSugar

SockSugar is a rather simple library to simplify working with WebSockets. It makes WebSockets work somewhat like regular HTTP requests.

## Usage

### Requests

Requests resemble HTTP requests, where the client send data to the server and wait for a response.

On the server side:

	var SockSugar = require("socksugar");

	var server = new SockSugar({
		port: 8081
	});

	server.on("connection", function(socket) {
		console.log("Connection!");

		socket.on("request", function(req) {
			console.log("Request for "+req.url);
			console.log(req.data);

			req.respond({
				msg: "No."
			});
		});
	});

On the client side:

	var sock = new SockSugar("ws://example.com");

	sock.on("ready", function() {
		sock.send("hi", {
			msg: "Hi!"
		}, function(err, data) {
			console.log(data);
		}
	});

The server side console will say:

	Connection!
	Request for hi
	{ msg: 'Hi!' }

The client side console will say:

	{ msg: 'No.' }

### Events

Unlike HTTP, the server can push data to the client. Here's a simple example, where writing something in the console will emitt an event to all connected clients and displayed with alert().

On the server side:

	var SockSugar = require("socksugar");

	var server = new SockSugar({
		port: 8081
	});

	process.stdin.on("data", function(data) {
		var str = data.toString("utf8");

		server.socks.forEach(function(sock) {
			sock.send("myEvent", {
				msg: str
			});
		});
	});

On the client side:

	var sock = new SockSugar("ws://example.com");

	sock.on("myEvent", function(data) {
		alert(data.msg);
	});
