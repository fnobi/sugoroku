// 状態を表すクラス
var State = function (name) {
	this.name = name;
	this.subStates = null;
	this.cursor = null;
};

State.prototype.addSubState = function (name) {
	if (!name) {
		return false;
	}

	if (!this.subStates) {
		this.initializeSubState();
	}

	if (name == 'initial') {
		return this.subStates['initial'];
	}

	if (this.subStates[name]) {
		return false;
	}

	return this.subStates[name] = this.createSubState(name);
};

State.prototype.createSubState = function (name) {
	var subState = new State(name);
	subState.parentState = this;
	subState.stateMachine = this.stateMachine;
	return subState;
};

State.prototype.initializeSubState = function () {
	var initialStateName = 'initial';
	var initialState = this.initialState =
		this.createSubState(initialStateName);

	this.subStates = {};
	this.subStates[initialStateName] = initialState;
	this.cursor = initialStateName;

	return initialState;
};

State.prototype.findSubState = function (pathToState) {
	var result = null;
	$.each(this.subStates, function (name, state) {
		if (state.path() == pathToState) {
			result = state;
		}
	});
	return result;
};

State.prototype.hasState = function (another) {
	if (another == this) {
		return true;
	}

	if (!this.subStates) {
		return false;
	}

	var result = false;
	$.each(this.subStates, function (name, subState) {
		result = result || subState.hasState(another);
	});

	return result;
};

State.prototype.transitions = function () {
	var self = this;
	var transitions = [];

	this.stateMachine.transitions.forEach(function (transition) {
		if (transition.from.hasState(self)) {
			transitions.push(transition);
		}
	});

	return transitions;
};

State.prototype.path = function () {
	if (!this.parentState) {
		return '';
	}

	return this.parentState.path() + '/' +this.name;
};

State.prototype.encode = function () {
	var self = this;
	var properties = ['x', 'y', 'elementSwitch'];
	var definition = {};

	properties.forEach(function (property) {
		definition[property] = self[property];
	});

	return definition;
};