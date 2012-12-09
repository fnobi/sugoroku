var codeCollection = require('codeCollection');

exports.index = function(req, res){
	res.render('index', { title: 'sugoroku' });
};

exports.editor = function(req, res){
	var codeName = req.params.code_name;

	if (!codeCollection.exists(codeName)) {
		res.statusCode = 404;
		res.end();
		return;
	}

	res.render('editor', {
		title: codeName,
		jsurl: codeCollection.url(codeName, 'editor')
	});
};

exports.codes = function (req, res) {
	var codeName = req.params.code_name;
	var codeAction = req.params.code_action;

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