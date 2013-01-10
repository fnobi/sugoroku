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
	var transitions = this.transitions();

	var callTransit = function (condition) {
		// 状態遷移の下準備
		// 今まで待っていたconditionを、取り消す
		self.clearListeners();
		stateMachine.transit(condition.name);
	};

	transitions.forEach(function (transition) {
		var condition = transition.condition;
		var name = condition.name;

		if (condition.listen) {
			condition.listen(function () {
				callTransit(condition);
			});
		}
	});
};

State.prototype.clearListeners = function () {
	var self = this;
	var stateMachine = this.stateMachine;

	this.transitions().forEach(function (transition) {
		var condition = transition.condition;

		if (condition.unlisten) {
			condition.unlisten();
		}
	});
};