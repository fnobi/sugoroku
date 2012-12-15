var util    = require('util'),
    daemon = require('daemon'),
    fs     = require('fs'),
    config = require('config');

// make express daemon-server
var daemonsv = function () {
	var args = process.argv;

	switch(args[2]) {
	case "stop":
		var pid = parseInt(fs.readFileSync(config.lockfile));
		try {
			process.kill(pid);
			util.puts("Successfully stopped daemon with pid: " + pid);
		} catch (e) {
			util.puts("Error stopping daemon: " + e);
		}
		process.exit(0);
		break;

	case "start":
		fs.open(config.logfile, 'a+', function(err, fd) {
			if (err) {
				return util.puts("Error starting daemon: " + err);
				process.exit(0);
			}
			daemon.start(fd);
			daemon.lock(config.lockfile);
		})
		break;

	default:
		util.puts("Usage: [start|stop]");
		process.exit(0);
		break;
	}

};

module.exports = daemonsv;