/* =============================================================================
  StateMachine - 状態遷移機械の実装
============================================================================= */

var StateMachine = (function () {
	// ひとつの状態を持つ状態遷移機械
	var StateMachine = function () {
		this.topLevelStates = [
			new this.State('initial')
		];
		this.state = this.initialState = this.topLevelStates[0];

		this.Transition.prototype.stateMachine =
		this.State     .prototype.stateMachine = this;

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
				transition.stateFrom.hasState(self.state)
				&&
				transition.condition == condition
			) {
				stateTo = transition.stateTo;
			}
		});

		return stateTo;
	};

	StateMachine.prototype.createState = function (name) {
		var subState = new State(name);
		subState.parentState = null;
		this.topLevelStates.push(subState);
		return subState;
	};

	// 状態を表すクラス
	var State = function (name) {
		this.name = name;
		this.subStates = [];
	};
	StateMachine.prototype.State = State;

	State.prototype.createSubState = function (name) {
		var subState = new State(name);
		subState.parentState = this;
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


	// 状態遷移のセット (遷移前の状態・環境・遷移後の状態のセット) を表すクラス
	var Transition = function (from, condition, to) {
		this.from = this.stateMachine.findState(from);

		this.condition = condition;
		this.stateTo   = to;

		this.stateMachine.transitions.push(this);
	};
	StateMachine.prototype.Transition = Transition;


	// jsonの定義書式からオブジェクト生成
	StateMachine.parse = function (definition) {
		var stateMachine = new StateMachine();
		var name;
		for (name in definition.states || {}) {
			stateMachine.createState(name);
		}
		for (name in definition.conditions || {}) {
			new Condition(name);
		}
		for (name in definition.transitions || {}) {
			new stateMachine.Transition(
				definition.transitions[name].from,
				definition.transitions[name].condition,
				definition.transitions[name].to
			);
		}
		return stateMachine;
	};

	// パスの形の表現から、stateを検索する
	StateMachine.findState = function (pathToState) {

	};

	return StateMachine;
})();