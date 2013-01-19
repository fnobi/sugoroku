var codeCollection = require(__dirname + '/../lib/codeCollection');

exports.index = function(req, res){
	res.render('index', { codeNames: codeCollection.codeNames() });
};

exports.editor = require(__dirname + '/editor');
exports.code = require(__dirname + '/code');
exports.postCode = require(__dirname + '/postCode');
exports.ex = require(__dirname + '/ex');
exports.exinit = require(__dirname + '/exinit');
exports.exregister = require(__dirname + '/exregister');