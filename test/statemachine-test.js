buster.testCase('state machine', {
	'instance': function () {
		assert(new StateMachine());
	},

	'initial state': function () {
		assert.equals(
			(new StateMachine()).state.name,
			'initial'
		);
	},

	'normal transition': function () {
		var stateName = 'hoge';
		var stateMachine = new StateMachine();

		var s1 = stateMachine.initialState;
		var c  = new stateMachine.Condition();
		var s2 = new stateMachine.State(stateName);

		new stateMachine.Transition(s1, c, s2);

		stateMachine.transit(c);

		assert.equals(stateMachine.state.name, stateName);
	},

	'sub state': function () {
		var stateMachine = new StateMachine();

		var s  = new stateMachine.State();
		var ss = s.createSubState();

		assert.equals(ss.parentState, s);
		assert.equals(s.subStates[0], ss);
	},

	'has state': function () {
		var stateMachine = new StateMachine();

		var s   = new stateMachine.State();
		var ss  = s.createSubState();
		var sss = ss.createSubState();

		assert(s.hasState(s));
		assert(s.hasState(ss));
		assert(s.hasState(sss));

		refute(ss.hasState(s));
		assert(ss.hasState(ss));
		assert(ss.hasState(sss));

		refute(sss.hasState(s));
		refute(sss.hasState(ss));
		assert(sss.hasState(sss));
	},

	'transition to sub state': function () {
		var stateMachine = new StateMachine();

		var s1 = stateMachine.initialState;
		var s2 = s1.createSubState('substate of initial');
		var s3 = new stateMachine.State('2nd state');

		var c1  = new stateMachine.Condition();
		var c2  = new stateMachine.Condition();

		new stateMachine.Transition(s1, c1, s2);
		new stateMachine.Transition(s1, c2, s3);

		stateMachine.transit(c1);
		assert.equals(stateMachine.state.name, 'substate of initial');

		stateMachine.transit(c2);
		assert.equals(stateMachine.state.name, '2nd state');
	}

});