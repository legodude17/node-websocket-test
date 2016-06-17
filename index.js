/*jslint node:true*/
'use strict';
var ws = require('nodejs-websocket'),
    log = require('single-line-log').stdout,
    fs = require('fs'),
    file,
    exec = require('child_process').exec;
var server = ws.createServer({secure:true}, function (conn) {
	console.log("New connection");
	conn.on("text", function (str) {
		console.log("Received " + str);
        if (str.indexOf('file:') === 0) {
            fs.appendFile('./' + (file = str.split(' ')[1]));
            conn.sendText('Command Acknowledged!');
            return;
        }
		conn.sendText(str.toUpperCase() + "!!!");
	});
    conn.on("binary", function (inStream) {
		// Empty buffer for collecting binary data
        if (!file) {
            conn.sendText('No file!');
        }
        inStream.pipe(fs.createWriteStream(file));
		var data = new Buffer(0);
        log('Receiving data...');
		// Read chunks of binary data and add to the buffer 
		inStream.on("readable", function () {
		    var newData = inStream.read();
		    if (newData) {
		        data = Buffer.concat([data, newData], data.length + newData.length);
                log('Receiving data...\n' + data.length + ' bytes received.');
            }
		});
		inStream.on("end", function () {
            log.clear('\n');
			console.log("Received " + data.length + " bytes of binary data");
            conn.sendText('File written');
            exec('play ' + file);
		});
	});
	conn.on("close", function (code, reason) {
		console.log("Connection closed");
	});
}).listen(8001);