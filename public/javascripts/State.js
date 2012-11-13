// 状態を表すクラス
var State = function (name) {
	this.name = name;
	this.subStates = [];
};

State.prototype.createSubState = function (name) {
	var subState = new State(name);
	subState.parentState = this;
	subState.stateMachine = this.stateMachine;
	this.subStates.push(subState);
	return subState;
};

State.prototype.hasState = function (another) {
	if (another == this) {
		return true;
	}

	var result = false;
	this.subStates.forEach(function (subState) {
		result = result || subState.hasState(another);
	});

	return result;
};

State.prototype.path = function () {
	return [
		this.parentState ? this.parentState.path() : '',
		this.name
	].join('/');
};

