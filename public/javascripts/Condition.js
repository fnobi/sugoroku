// 環境を表すクラス

var Condition = function (name) {
	this.name = name;
};

Condition.prototype.encode = function () {
	return this.name;
};

// Conditionのoptionを記述する際の、ヘルパークラス
Condition.Timeout = function (ms) {
	this.listen = function (transit) {
		this.timer = setTimeout(transit, ms || 0);
	};
	this.unlisten = function () {
		clearInterval(this.timer);
	};
};

Condition.Click = function (selector) {
	var $element;
	this.listen = function (transit) {
		$element.on('click', transit);
	};
	this.unlisten = function () {
		$element.off('click');
	};
	$(function () {
		$element = $(selector);
	});
};