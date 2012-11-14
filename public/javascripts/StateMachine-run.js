StateMachine.prototype.run = function () {
	this.state.action();
};

State.prototype.action = function () {
	// switchElementを反映
	for (var selector in this.elementSwitch) {
		if (this.elementSwitch[selector]) {
			$(selector).show();
		} else {
			$(selector).hide();
		}
	}

	// 次のconditionを待つ
	this.listenConditions();
};

State.prototype.listenConditions = function () {
	var self = this;
	var stateMachine = this.stateMachine;

	var callTransit = function (condition) {
		// 状態遷移の下準備
		// 今まで待っていたconditionを、取り消す
		self.clearListeners();

		stateMachine.transit(condition.name);
	};

	this.listeners = {};

	this.transitions().forEach(function (transition) {
		var condition = transition.condition;
		if (condition.type == 'timeout') {
			// timeout: 数ミリ秒待ったらtransit
			var timeout = setTimeout(function () {
				self.listeners[condition.name] = false;
				callTransit(condition);
			}, condition.ms);

			self.listeners[condition.name] = timeout;

		} else if (condition.type == 'click') {
			// click: あるelementがクリックされたらtransit

			$(condition.element).on('click', function () {
				callTransit(condition);
			});
		}
	});
};

State.prototype.clearListeners = function () {
	var self = this;

	this.transitions().forEach(function (transition) {
		var condition = transition.condition;
		if (condition.type == 'timeout') {
			clearTimeout(self.listeners[condition.name]);

		} else if (condition.type == 'click') {
			$(condition.element).off('click');
		}
	});
};