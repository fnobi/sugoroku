var config = module.exports;

config['sugoroku test'] = {
	rootPath: '../',
	environment: 'browser', // 'browser' or 'node'
	sources: [
		'State.js',
		'Condition.js',
		'Transition.js',
		'StateMachine.js'
	],
	tests: [
		'test/*-test.js'
	]
};