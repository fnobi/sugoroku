var ex = require(__dirname + '/../lib/ex');
var escape = require('escape-html');

module.exports = function (req, res) {
	var name = req.body.name;
	name = escape(name);

	ex.create(name, function (err, exid) {
		if (err) {
			console.error(err);
			res.statusCode = 500;
			res.end();
		}

		res.redirect('/ex/' + exid + '/1');
	});

};