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

	'state name is required': function () {
		var stateMachine = new StateMachine();

		refute(stateMachine.addState());
	},

	'state name is uniq': function () {
		var stateMachine = new StateMachine();

		stateMachine.addState('hoge');

		refute(stateMachine.addState('hoge'));
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


	'sub state': function () {
		var stateMachine = new StateMachine();

		var s  = stateMachine.addState('a');
		var ss = s.addSubState('aa');

		assert.equals(ss.parentState, s);
		assert.equals(s.subStates['aa'], ss);
	},

	'has state': function () {
		var stateMachine = new StateMachine();

		var s   = stateMachine.addState('a');
		var ss  = s.addSubState('aa');
		var sss = ss.addSubState('aaa');

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
	},

	'decode empty definition': function () {
		var stateMachine = StateMachine.decode({});
		assert.equals(stateMachine.state.path(), '/initial');
	},

	'decode state transition': function () {
		var stateMachine = StateMachine.decode({
			states: {
				a: { }
			},
			conditions: {
				c: { }
			},
			transitions: [{
				from: '/initial',
				to: '/a',
				condition: 'c'
			}]
		});

		stateMachine.transit('c');
		assert.equals(stateMachine.state.path(), '/a');
	}
});