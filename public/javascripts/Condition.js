// 環境を表すクラス

// Conditionにはtypeとnameがある
// typeはあくまで「どのように待つか」で、実際に何秒待つかなどは、
// nameにひもづけられたパラメーターで記述される
// conditionを直接のjsで書くとしたら、conditionはlistenとunlistenさえ
// 持っていれば何でもいい。

var Condition = function (name) {
	this.name = name;
};

Condition.prototype.encode = function () {
	var self = this;
	var properties = ['type', 'ms', 'element'];
	var definition = {};

	properties.forEach(function (property) {
		definition[property] = self[property];
	});

	return definition;
};