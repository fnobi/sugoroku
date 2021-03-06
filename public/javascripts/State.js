// 状態を表すクラス
var State = function (name) {
	this.name = name;
	this.subStates = null;
	this.cursor = null;

	this.actions = [];
};
State.INITIAL_STATE_NAME = 'initial';

State.prototype.addSubState = function (name) {
	if (!name) {
		return false;
	}

	if (!this.subStates) {
		this.initializeSubState();
	}

	if (name == State.INITIAL_STATE_NAME) {
		return this.subStates[State.INITIAL_STATE_NAME];
	}

	if (this.subStates[name]) {
		return false;
	}

	return this.subStates[name] = this.createSubState(name);
};

State.prototype.addAction = function (actionName) {
	this.actions.push(actionName);
};

State.prototype.remove = function () {
	if (this.name == State.INITIAL_STATE_NAME) {
		throw new Error('can\'t destroy initial state.');
	}

	this.clearTransitions();
	this.parentState.removeSubState(this);
	return true;
};

State.prototype.removeSubState = function (target) {
	var name = target.name;

	// 自分の直下のstateなら、deleteして終了
	if (this.subStates[name]) {
		delete this.subStates[name];
		return true;
	}

	return false;
};

State.prototype.removeAction = function (removeIndex) {
	var newActions = [];
	var index = 0;
	this.actions.forEach(function (actionName) {
		if (removeIndex == index) {
			index++;
			return;
		}
		newActions.push(actionName);
		index++;
	});
	this.actions = newActions;
	return newActions;
};

State.prototype.clearTransitions = function () {
	var self = this;
	var stateMachine = this.stateMachine;

	var transitions = [];
	this.stateMachine.transitions.forEach(function (transition) {
		if (
			transition.from.hasState(self)
			|| transition.to.hasState(self)
		) {
			return;
		}

		transitions.push(transition);
	});

	this.stateMachine.transitions = transitions;
};

State.prototype.createSubState = function (name) {
	var subState = new State(name);
	subState.parentState = this;
	subState.stateMachine = this.stateMachine;
	return subState;
};

State.prototype.initializeSubState = function () {
	var initialStateName = State.INITIAL_STATE_NAME;
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
	var properties = ['x', 'y', 'actions', 'expanded'];
	var definition = {};

	properties.forEach(function (property) {
		definition[property] = self[property];
	});

	return definition;
};