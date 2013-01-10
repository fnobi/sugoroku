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

stateMachine.addCondition('direct', new Condition.Timeout(0));
stateMachine.addCondition('wait_2s', new Condition.Timeout(2000));

stateMachine.addCondition('push_g', new Condition.Click('#g_button'));
stateMachine.addCondition('push_c', new Condition.Click('#c_button'));
stateMachine.addCondition('push_p', new Condition.Click('#p_button'));