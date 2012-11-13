StateMachine.prototype.run = function () {
	this.state.run();
};

State.prototype.run = function () {
	for (var selector in this.elementSwitch) {
		if (this.elementSwitch[selector]) {
			$(selector).show();
		} else {
			$(selector).hide();
		}
	}

	this.listenConditions();
};

State.prototype.listenConditions = function () {
	var stateMachine = this.stateMachine;

	this.transitions().forEach(function (transition) {
		var condition = transition.condition;
		if (condition.type == 'timeout') {
			setTimeout(function () {
				stateMachine.transit(condition.name);
			}, condition.ms);
		}
	});
};