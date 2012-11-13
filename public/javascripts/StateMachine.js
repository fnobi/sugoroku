/* =============================================================================
  StateMachine - 状態遷移機械の実装
============================================================================= */

var StateMachine = function () {
	this.topLevelStates = [];

	this.transitions = [];
	this.conditions = {};

	this.createState('initial');
	this.state = this.initialState = this.topLevelStates[0];
};

// 状態遷移機械にconditionを与えて、状態を遷移させる
StateMachine.prototype.transit = function (condition) {
	var state = this.stateToTransit(condition);

	if (!state) {
		throw new Error('no state to transit to.');
	}

	this.state = state;
	if (state.run) {
		state.run();
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

	var state = null;
	this.topLevelStates.forEach(function (topLevelState) {
		if (topLevelState.path() == pathToState) {
			state = topLevelState;
		}
	});

	return state;
};

StateMachine.prototype.findCondition = function (name) {
	// console.log('[find condition: ' + name + ']');
	// console.log(this.conditions);

	// conditionが渡されることもあるので、その時はそのまま返す
	if (name.name) {
		return name;
	}

	return this.conditions[name] || null;
};

// 状態を新規作成
StateMachine.prototype.createState = function (name) {
	var state;

	if (state = this.findState('/' + name)) {
		return state;
	}

	state = new State(name);
	state.parentState = null;
	state.stateMachine = this;
	this.topLevelStates.push(state);
	return state;
};

// 環境を新規作成(定義)
StateMachine.prototype.createCondition = function (name) {
	var condition = new Condition(name);

	// 親と子お互いに、相手へのリファレンスを持つ
	condition.stateMachine = this;
	this.conditions[name] = condition;

	return condition;
};

// 遷移を新規作成(定義)
StateMachine.prototype.createTransition = function (from, cond, to) {
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
StateMachine.parse = function (definition) {
	var stateMachine = new StateMachine();
	var name;

	for (name in definition.states || {}) {
		var state = stateMachine.createState(name);
		state = $.extend(true, state, definition.states[name]);
	}
	for (name in definition.conditions || {}) {
		var cond = stateMachine.createCondition(name);
		cond = $.extend(true, cond, definition.conditions[name]);
	}
	(definition.transitions || []).forEach(function (t) {
		stateMachine.createTransition(t.from, t.condition, t.to);
	});
	return stateMachine;
};

