var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {

	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();	
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
	});
} else {
	console.log('Worker ' + cluster.worker.id + ' running!');  
    //change this line to Your Node.js app entry point.
    require("./server.js");
}