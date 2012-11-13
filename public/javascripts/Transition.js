// 状態遷移のセット (遷移前の状態・環境・遷移後の状態のセット) を表すクラス
var Transition = function (from, condition, to) {
	this.from      = from;
	this.condition = condition;
	this.to        = to;
};


