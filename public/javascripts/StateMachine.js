/* =============================================================================
  StateMachine - 状態遷移機械の実装
============================================================================= */

var StateMachine = function (name) {
	this.name = name;
	this.transitions = [];
	this.conditions  = {};

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

	if (state.action) {
		state.action();
	}

	return state;
};

// この状態遷移機械が、conditionを与えたらどのstateに進むかを計算
StateMachine.prototype.stateToTransit = function (condition) {
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

StateMachine.prototype.findCondition = function (name) {
	// conditionが渡されることもあるので、その時はそのまま返す
	if (name.name) {
		return name;
	}

	return this.conditions[name] || null;
};

// 状態を新規作成
StateMachine.prototype.addState = function (name) {
	return this.rootState.addSubState(name);
};

// 環境を新規作成(定義)
StateMachine.prototype.addCondition = function (name) {
	var condition = new Condition(name);

	// 親と子お互いに、相手へのリファレンスを持つ
	condition.stateMachine = this;
	this.conditions[name] = condition;

	return condition;
};

// 遷移を新規作成(定義)
StateMachine.prototype.addTransition = function (from, cond, to) {
	from = this.findState(from);
	cond = this.findCondition(cond);
	to   = this.findState(to);

	var transition = new Transition(from, cond, to);

	// 親と子お互いに、相手へのリファレンスを持つ
	transition.stateMachine = this;
	this.transitions.push(transition);

	return transition;
};

// jsonの定義書式からオブジェクト生成
StateMachine.decode = function (definition) {
	var stateMachine = new StateMachine();
	var name;

	// state読み込み
	for (name in definition.states || {}) {
		var state = stateMachine.addState(name);
		state = $.extend(true, state, definition.states[name]);
	}

	// condition読み込み
	for (name in definition.conditions || {}) {
		var cond = stateMachine.addCondition(name);
		cond = $.extend(true, cond, definition.conditions[name]);
	}

	// transition読み込み
	(definition.transitions || []).forEach(function (t) {
		stateMachine.addTransition(t.from, t.condition, t.to);
	});

	// その他読み込み
	stateMachine.elements = definition.elements || [];

	return stateMachine;
};

// stateMachineオブジェクトをjson定義書式に直す
StateMachine.encode = function (stateMachine) {

};