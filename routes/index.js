var resources = require('resources');

/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'sugoroku' });
};

exports.editor = function(req, res){
	var resourceName = req.params[0];

	res.render('editor', {
		title: resourceName,
		resourcePath: '/codes/' + resourceName + '.js'
	});
};

exports.viewer = function(req, res){
	var resourceName = req.params[0];

	res.render('viewer', {
		title: resourceName,
		resourcePath: '/codes/' + resourceName + '.js'
	});
};

exports.codes = function (req, res) {
	var resourceName = req.params[0];

	resources.read(resourceName, function (err, result) {
		if (err) {
			console.error(err);
			process.exit(1);
		}

		res.end('var stateRoot = ' + result + ";");
	});
};