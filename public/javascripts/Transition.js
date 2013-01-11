// 状態遷移のセット (遷移前の状態・環境・遷移後の状態のセット) を表すクラス
var Transition = function (from, condition, to) {
	this.from      = from;
	this.condition = condition;
	this.to        = to;
};

Transition.prototype.encode = function () {
	return {
		from: this.from.path(),
		condition: this.condition.name,
		to: this.to.path()
	};
};

Transition.prototype.remove = function () {
	this.stateMachine.removeTransition(this);
};