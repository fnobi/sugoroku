/* =============================================================================
  StateMachine - 状態遷移機械の実装
============================================================================= */

// ひとつの状態を持つ状態遷移機械
var StateMachine = function () {
	this.state = this.initialState = new this.State('initial');

	this.Transition.prototype.stateMachine = this;
	this.transitions = [];
};

// 状態遷移機械にconditionを与えて、状態を遷移させる
StateMachine.prototype.transit = function (condition) {
	var stateTo = this.findStateTo(condition);

	if (!stateTo) {
		throw new Error('no state to transit to.');
	}

	this.state = stateTo;
};

// この状態遷移機械が、conditionを与えたらどのstateに進むかを計算
StateMachine.prototype.findStateTo = function (condition) {
	var self = this;
	var stateTo = null;

	this.transitions.forEach(function (transition) {
		if (
			transition.stateFrom == self.state
			&&
			transition.condition == condition
		) {
			stateTo = transition.stateTo;
		}
	});

	return stateTo;
};

// 状態を表すクラス
StateMachine.prototype.State = function (name) {
	this.name = name;
};

// 環境を表すクラス
StateMachine.prototype.Condition = function () {
};

// 状態遷移のセット (遷移前の状態・環境・遷移後の状態のセット) を表すクラス
StateMachine.prototype.Transition = function (stateFrom, condition, stateTo) {
	this.stateFrom = stateFrom;
	this.condition = condition;
	this.stateTo   = stateTo;

	this.stateMachine.transitions.push(this);
};