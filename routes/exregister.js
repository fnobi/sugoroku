var ex             = require(__dirname + '/../lib/ex'),
    codeCollection = require(__dirname + '/../lib/codeCollection'),
    config         = require('config'),
    escape         = require('escape-html');

module.exports = function (req, res) {
	var name = req.body.name;
	var programer = req.body.programer;
	name = escape(name);

	ex.create(name, programer, function (err, exid) {
		if (err) {
			console.error(err);
			res.statusCode = 500;
			res.end();
		}

		codeCollection.copy('ex', exid);

		res.redirect(config.baseURL + 'ex/' + exid + '/1');
	});

};