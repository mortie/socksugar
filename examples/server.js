var SockSugar = require("..");

var server = new SockSugar({
	port: 8081
});

server.on("connection", function(sock) {
	console.log("connection!");

	sock.on("request", function(req) {
		console.log("Request for "+req.url);
		console.log(req.data);

		req.reply({
			msg:" Hello there!"
		});
	});
});

process.stdin.on("data", function(data) {
	str = data.toString("utf8");

	if (str.split(/\s+/)[0] == "send") {
		console.log("Sending myEvent to all connections.");

		server.socks.forEach(function(sock) {
			sock.send("myEvent", {
				msg: str.replace(/^\w+\s+/, "").trim()
			});
		});
	} else {
		console.log("Unknown command.");
	}
});

console.log("Running SockSugar on port 8081.");
