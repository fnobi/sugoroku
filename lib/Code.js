var fs   = require('fs'),
    path = require('path'),
    util = require('util');

// sugorokuで書かれたプログラムを表すクラス
var Code = function (name) {
	this.name = name;
};

// このプログラムをリクエストするためのURLを返す
Code.prototype.url = function (codeAction) {
	return util.format(
		'/codes/%s%s.js',
		this.name,
		(codeAction ? ('-' + codeAction) : '')
	);
};

// このプログラム本体のある場所を返す
Code.prototype.filePath = function () {
	return util.format('%s/../codes/%s.json', __dirname, this.name);
};

// このプログラムの実態が存在するかを返す
Code.prototype.exists = function () {
	return (fs.exists ? fs : path).existsSync(this.filePath());
};

module.exports = Code;