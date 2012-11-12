var config = require('config'),
    fs     = require('fs');

var resources = {};

resources.read = function (name, callback) {
	fs.readFile(config.resourcePath + name + '.json', 'utf8', callback);
};

module.exports = resources;