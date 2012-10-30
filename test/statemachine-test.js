buster.testCase('state machine', {
	'instance': function () {
		assert(new StateMachine());
	},

	'initial state': function () {
		assert.equals(
			new StateMachine().state.name,
			'initial'
		);
	},

	'normal transition': function () {
		var stateName = 'hoge';
		var stateMachine = new StateMachine();

		var s = new stateMachine.State(stateName);
		var c = new stateMachine.Condition();

		new stateMachine.Transition(stateMachine.initialState, c, s);

		stateMachine.transit(c);

		assert.equals(stateMachine.state.name, stateName);
	}
});