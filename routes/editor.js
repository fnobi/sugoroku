var codeCollection = require(__dirname + '/../lib/codeCollection');

module.exports = function(req, res){
	var codeName = req.params.code_name;

	if (!codeCollection.exists(codeName)) {
		res.statusCode = 404;
		res.end();
		return;
	}

	res.render('editor', {
		jsurl: codeCollection.url(codeName, 'editor')
	});
};