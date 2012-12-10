buster.testCase('state machine definition', {
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
	},

	'encode empty definition': function () {
		var stateMachine = StateMachine.decode({});
		assert.equals(stateMachine.encode(), {});
	},

	'encode state machine': function () {
		var definition = {
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
		};

		var stateMachine = StateMachine.decode(definition);

		assert.equals(
			stateMachine.encode(),
			definition
		);
	}
});