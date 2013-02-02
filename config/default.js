module.exports = {
        port: 2569,
        sessionSecret: 'topsecret',
        mongodb: {
                host: 'localhost',
                database: 'sugoroku'
        },

        codedir: __dirname + '/../code/',
        lockfile: __dirname + '/../pids/daemon1.pid',
        logfile: __dirname +  '/../logs/' + process.env.NODE_ENV + '.log',

        baseURL: 'http://localhost:2569/'
};