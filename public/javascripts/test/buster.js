var config = module.exports;

config['sugoroku test'] = {
	rootPath: '../',
	environment: 'browser', // 'browser' or 'node'
	sources: [
		'jquery-1.8.2.js',

		'State.js',
		'Condition.js',
		'Transition.js',
		'StateMachine.js'
	],
	tests: [
		'test/*-test.js'
	]
};