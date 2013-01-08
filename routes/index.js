var codeCollection = require(__dirname + '/../lib/codeCollection');

exports.index = function(req, res){
	res.render('index', { codeNames: codeCollection.codeNames() });
};

exports.editor = require(__dirname + '/editor');
exports.code = require(__dirname + '/code');
exports.postCode = require(__dirname + '/postCode');