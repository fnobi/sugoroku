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

		var s1 = stateMachine.initialState;
		var c  = stateMachine.createCondition('c');
		var s2 = stateMachine.createState(stateName);

		stateMachine.createTransition(s1, c, s2);

		stateMachine.transit('c');

		assert.equals(stateMachine.state.path(), '/' + stateName);
	},

	'sub state': function () {
		var stateMachine = new StateMachine();

		var s  = stateMachine.createState();
		var ss = s.createSubState();

		assert.equals(ss.parentState, s);
		assert.equals(s.subStates[0], ss);
	},

	'has state': function () {
		var stateMachine = new StateMachine();

		var s   = stateMachine.createState();
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
		var s2 = s1.createSubState('a');
		var s3 = stateMachine.createState('b');

		var c1  = stateMachine.createCondition('c1');
		var c2  = stateMachine.createCondition('c2');

		stateMachine.createTransition(s1, c1, s2);
		stateMachine.createTransition(s1, c2, s3);

		stateMachine.transit(c1);
		assert.equals(stateMachine.state.path(), '/initial/a');

		stateMachine.transit(c2);
		assert.equals(stateMachine.state.path(), '/b');
	},

	'parse empty definition': function () {
		var stateMachine = StateMachine.parse({});
		assert.equals(stateMachine.state.path(), '/initial');
	},

	'parse state transition': function () {
		var stateMachine = StateMachine.parse({
			states: {
				a: { }
			},
			conditions: {
				c: { }
			},
			transitions: {
				t: {
					from: '/initial',
					to: '/a',
					condition: 'c'
				}
			}
		});

		assert.equals(stateMachine.topLevelStates.length, 2);

		stateMachine.transit('c');
		assert.equals(stateMachine.state.path(), '/a');

		// conditionのparseができてないと思う。
		// newはStatemachine以外、外からは叩かない
	}

});