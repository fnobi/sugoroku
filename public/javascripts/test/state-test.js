buster.testCase('state', {
	'require name': function () {
		var stateMachine = new StateMachine();

		refute(stateMachine.addState());
	},

	'require unique name': function () {
		var stateMachine = new StateMachine();

		stateMachine.addState('hoge');

		refute(stateMachine.addState('hoge'));
	},

	'add sub state': function () {
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
	}

});