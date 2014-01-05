var fs = require('fs'),server = require('http').createServer(function(req,res) {
	if(req.url.match(/data\/.+/gi)) {
		var Type = {
			'js':'application/javascript',
			'css':'text/css',
			'text':'text/plain'
		};
		var ext = req.url.split(".");
		ext = ext[ext.length-1];
		fs.readFile(__dirname+req.url,function(err,data) {
			if(err) {
				res.writeHead(500);
				return res.end("Unable to read the index file.");
			}
			res.writeHead(200,{'Content-type':(Type[ext] || 'text')});
			res.end(data);
		});
	} else {
		fs.readFile(__dirname+"/index.html",function(err,data) {
			if(err) {
				res.writeHead(500);
				return res.end("Unable to read the index file.");
			}
			res.writeHead(200);
			res.end(data);
		});
	}
}).listen(8000),io = require('/usr/local/lib/node_modules/socket.io').listen(server);

var players = [];
io.sockets.on('connection',function(socket) {
	socket.emit('welcome',{'status':'200'});
	socket.on('request',function(req) {
		if(req == 'player_data') {
			socket.emit('player_data',{data:players});
		}
	});
	socket.on('player_data',function(res) {
		console.log("SOCKET DATA RECEIVED AN OBJECT OF TYPE:");
		console.log(typeof res);
		console.log("With ID: "+res.id);
		console.log(res);
	});
});