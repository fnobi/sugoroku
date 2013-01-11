/* =============================================================================
  StateMachine - 状態遷移機械の実装
============================================================================= */

var StateMachine = function (name) {
	this.name = name;
	this.transitions = [];
	this.conditions  = {};
	this.actions     = {};

	this.initializeRootState();
};

StateMachine.prototype.initializeRootState = function () {
	var rootState = this.rootState = new State(this.name);
	rootState.stateMachine = this;
	this.state = rootState.initializeSubState();
	return rootState;
};

// 状態遷移機械にconditionを与えて、状態を遷移させる
StateMachine.prototype.transit = function (condition) {
	var state = this.stateToTransit(condition);

	if (!state) {
		// 行き先となるstateがなかった場合は何もせず、現在のstateを返す
		return this.state;
	}

	// state書き換え
	this.state = state;

	if (state.run) {
		state.run();
	}

	return state;
};

// この状態遷移機械が、conditionを与えたらどのstateに進むかを計算
StateMachine.prototype.stateToTransit = function (condition) {
	var self = this;
	var state = null;
	var condName = condition.name || condition;

	this.state.transitions().forEach(function (transition) {
		var tCond = transition.condition;
		var tCondName = tCond.name || tCond;

		if (condName == tCondName){
			state = transition.to;
			return;
		}
	});

	return state;
};

StateMachine.prototype.findState = function (pathToState) {
	// Stateオブジェクトそのものが渡されたら、そのまま返す
	// ここで判定するんじゃなく、Transitionの中で分岐した方がいい気もする
	if (pathToState.path) {
		return pathToState;
	}

	return this.rootState.findSubState(pathToState);
};

StateMachine.prototype.findCondition = function (condition) {
	// conditionが渡された場合は、そのまま返す
	if (condition.name) {
		return condition;
	}

	// condition.nameが渡された場合は、そのnameの持ち主のconditionを返す
	return this.conditions[condition] || null;
};

StateMachine.prototype.findTransition = function (from, to) {
	// condition.nameが渡された場合は、そのnameの持ち主のconditionを返す
	var result = null;
	this.transitions.forEach(function (transition) {
		if (result) {
			return;
		}
		if (transition.from === from && transition.to === to) {
			// console.log('[found]');
			// console.log(transition);
			result = transition;
		}
	});
	return result;
};

StateMachine.prototype.findAction = function (action) {
	// actionが渡された場合は、そのまま返す
	if (action.name) {
		return action;
	}

	// action.nameが渡された場合は、そのnameの持ち主のactionを返す
	return this.actions[action] || null;
};

// 状態を新規作成
StateMachine.prototype.addState = function (name) {
	return this.rootState.addSubState(name);
};

// 環境を新規作成(定義)
StateMachine.prototype.addCondition = function (name, option) {
	var condition = this.findCondition(name) || new Condition(name);

	condition = $.extend(true, condition, option || {});

	// 親と子お互いに、相手へのリファレンスを持つ
	condition.stateMachine = this;
	this.conditions[name] = condition;

	return condition;
};

// 遷移を新規作成(定義)
StateMachine.prototype.addTransition = function (from, condName, to) {
	from = this.findState(from);
	to   = this.findState(to);

	var cond = this.findCondition(condName) || this.addCondition(condName);
	var transition = new Transition(from, cond, to);

	// 親と子お互いに、相手へのリファレンスを持つ
	transition.stateMachine = this;
	this.transitions.push(transition);

	return transition;
};

StateMachine.prototype.removeTransition = function (transition) {
	var removed = [];

	this.transitions.forEach(function (t) {
		if (t === transition) {
			return;
		}
		removed.push(t);
	});

	this.transitions = removed;
};

// アクションを新規作成(定義)
StateMachine.prototype.addAction = function (name, fn) {
	var action = this.findAction(name) || new Action(name, fn);

	// 親と子お互いに、相手へのリファレンスを持つ
	action.stateMachine = this;
	this.actions[name] = action;

	return action;
};

// jsonの定義書式からオブジェクト生成
StateMachine.decode = function (json) {
	var stateMachine = new StateMachine();
	var name;

	// state読み込み
	for (name in json.states || {}) {
		var state = stateMachine.addState(name);
		state = $.extend(true, state, json.states[name]);
	}

	// condition読み込み
	(json.conditions || []).forEach(function (condName) {
		stateMachine.addCondition(condName);
	});

	// transition読み込み
	(json.transitions || []).forEach(function (t) {
		stateMachine.addTransition(t.from, t.condition, t.to);
	});

	// action読み込み
	(json.actions || []).forEach(function (actionName) {
		stateMachine.addAction(actionName);
	});

	// その他読み込み
	stateMachine.src = json.src || [];

	return stateMachine;
};

// stateMachineオブジェクトをjson定義書式に直す
StateMachine.prototype.encode = function () {
	return {
		states : this.encodeStates(),
		conditions : this.encodeConditions(),
		transitions : this.encodeTransitions(),
		actions: this.encodeActions(),
		src: this.src || []
	};
};

StateMachine.prototype.encodeStates = function () {
	var json = {};
	$.each(this.rootState.subStates, function (name, state) {
		json[name] = state.encode();
	});
	return json;
};

StateMachine.prototype.encodeConditions = function () {
	var json = [];
	$.each(this.conditions, function () {
		json.push(this.encode());
	});
	return json;
};

StateMachine.prototype.encodeActions = function () {
	var json = [];
	$.each(this.actions, function () {
		json.push(this.encode());
	});
	return json;
};

StateMachine.prototype.encodeTransitions = function () {
	var json = [];
	$.each(this.transitions, function () {
		json.push(this.encode());
	});
	return json;
};

