// アクションを表すクラス

var Action = function (name, fn) {
	this.name = name;
	this.fn = fn || function () {};
};

Action.prototype.exec = function () {
	this.fn.apply(this.stateMachine, []);
};

Action.prototype.encode = function () {
	return this.name;
};