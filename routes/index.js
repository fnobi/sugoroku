var codeCollection = require('codeCollection');

exports.index = function(req, res){
	res.render('index', { });
};

exports.editor = require(__dirname + '/editor');
exports.codeIndex = require(__dirname + '/codeIndex');
exports.code = require(__dirname + '/code');
exports.postCode = require(__dirname + '/postCode');