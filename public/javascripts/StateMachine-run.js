StateMachine.prototype.run = function () {
	this.state.run();
};

StateMachine.prototype.action = function (actionName) {
	var action = this.findAction(actionName);
	if (!action) {
		return;
	}
	action.exec();
};

State.prototype.run = function () {
	var self = this;
	var stateMachine = this.stateMachine;

	// 次のconditionを待つ
	this.listenConditions();

	// actionsを実行
	(this.actions || []).forEach(function (actionName) {
		stateMachine.action(actionName);
	});
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

		if (!condition) {
			return;
		}

		if (condition.listen) {
			condition.listen.call(stateMachine, function () {
				callTransit(condition);
			});
		}
	});
};

State.prototype.clearListeners = function () {
	var self = this;
	var stateMachine = this.stateMachine;
	var transitions = this.transitions();

	transitions.forEach(function (transition) {
		var condition = transition.condition;

		if (!condition) {
			return;
		}

		if (condition.unlisten) {
			condition.unlisten();
			condition.unlisten.call(stateMachine);
		}
	});
};