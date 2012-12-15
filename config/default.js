module.exports = {
	port: 2569,
	codedir: __dirname + '/../code/',
	lockfile: __dirname + '/../pids/daemon1.pid',
	logfile: __dirname +  '/../logs/' + process.env.NODE_ENV + '.log'
};