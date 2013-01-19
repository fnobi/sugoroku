var fs   = require('fs');
var path = require('path');
var random = require('node-random');

var EX_PATH = __dirname + '/../ex/';

var ex = {
	path: function (exid) {
		return EX_PATH + exid + '.json';
	},

	exists: function (exid) {
		return fs.existsSync(ex.path(exid));
	},

	data: function (exid, callback) {
		fs.readFile(ex.path(exid), 'utf8', function (err, res) {
			if (err) {
				return callback(err);
			}

			callback(null, JSON.parse(res));
		});
	},

	save: function (exid, obj, callback) {
		fs.writeFile(ex.path(exid), JSON.stringify(obj), callback);
	},

	create: function (name, callback) {
		random.strings({
			"length": 1,
			"number": 20,
			"upper": false,
			"digits": false
		}, function(err, data) {
			if (err) {
				return callback(err);
			}
			var exid = data.join('');

			ex.save(exid, {
				name: name
			}, function (err) {
				callback(err, exid);
			});
		});
	}
};

module.exports = ex;

