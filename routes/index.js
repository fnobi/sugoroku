var codeCollection = require('codeCollection');

/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'sugoroku' });
};

exports.editor = function(req, res){
	var codeName = req.params[0];

	if (!codeCollection.exists(codeName)) {
		res.statusCode = 404;
		res.end();
		return;
	}

	res.render('editor', {
		title: 'edit: ' + codeName,
		jsurl: codeCollection.url(codeName, 'editor')
	});
};

exports.codes = function (req, res) {
	var codeName = req.params[0];
	var codeAction = req.params[2];

	codeCollection.codeText(codeName, codeAction, function (err, codeText) {
		if (err) {
			console.error(err);
			res.statusCode = 404;
			res.end();
			return;
		}

		res.setHeader('Content-Type', 'text/javascript');
		res.end(codeText);
	});
};