// 環境を表すクラス

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