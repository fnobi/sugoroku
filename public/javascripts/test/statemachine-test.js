buster.testCase('state machine', {
	'instance': function () {
		assert(new StateMachine());
	},

	'initial state': function () {
		assert.equals(
			(new StateMachine()).state.path(),
			'/initial'
		);
	},

	'normal transition': function () {
		var stateName = 'hoge';
		var stateMachine = new StateMachine();

		var s1 = stateMachine.findState('/initial');
		var c  = stateMachine.addCondition('c');
		var s2 = stateMachine.addState(stateName);

		stateMachine.addTransition(s1, c, s2);

		stateMachine.transit('c');

		assert.equals(stateMachine.state.path(), '/' + stateName);
	},

	'transition to sub state': function () {
		var stateMachine = new StateMachine();

		var s1 = stateMachine.findState('/initial');
		var s2 = s1.addSubState('a');
		var s3 = stateMachine.addState('b');

		var c1  = stateMachine.addCondition('c1');
		var c2  = stateMachine.addCondition('c2');

		stateMachine.addTransition(s1, c1, s2);
		stateMachine.addTransition(s1, c2, s3);

		stateMachine.transit(c1);
		assert.equals(stateMachine.state.path(), '/initial/a');

		stateMachine.transit(c2);
		assert.equals(stateMachine.state.path(), '/b');
	},

	'delegation': function () {
		var stateMachine = new StateMachine();

		var s1 = stateMachine.findState('/initial');
		var s2 = stateMachine.addState('a');
		var s2_1 = s1.initialState;
		var s2_2 = s1.addSubState('aa');
		var s3 = stateMachine.addState('b');

		var c1  = stateMachine.addCondition('c1');
		var c2  = stateMachine.addCondition('c2');

		// delegationはない方がいい可能性もあるのか...

		assert(true);
	}
});