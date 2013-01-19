var fs     = require('fs'),
    path   = require('path'),
    util   = require('util'),
    config = require('config');

// sugorokuで書かれたプログラムを表すクラス
var Code = function (name) {
	this.name = name;
};

// このプログラムをリクエストするためのURLを返す
Code.prototype.url = function (codeAction) {
	return util.format(
		'/code/%s%s.js',
		this.name,
		(codeAction ? ('-' + codeAction) : '')
	);
};

// このプログラム本体のある場所を返す
Code.prototype.filePath = function () {
	return path.join(config.codedir, this.name + '.json');
};

// このプログラムの実態が存在するかを返す
Code.prototype.exists = function () {
	return (fs.exists ? fs : path).existsSync(this.filePath());
};

// バックアップファイルを作成する
Code.prototype.backup = function (key) {
	var filePath = this.filePath();
	var backupPath = this.backupPath(key);

	if (!fs.existsSync(filePath)) {
		return;
	}

	fs.createReadStream(filePath).pipe(
		fs.createWriteStream(backupPath)
	);
};

// バックアップファイルからファイルを再構築
Code.prototype.restore = function (key) {
	var filePath = this.filePath();
	var backupPath = this.backupPath(key);

	if (!fs.existsSync(backupPath)) {
		return;
	}

	fs.createReadStream(backupPath).pipe(
		fs.createWriteStream(filePath)
	);
};

// バックアップパスを取得
Code.prototype.backupPath = function (key) {
	var filePath = this.filePath();
	var backupPath = [filePath];
	if (key) {
		backupPath.push(key);
	}
	backupPath.push('backup');
	return backupPath.join('.');
};

module.exports = Code;