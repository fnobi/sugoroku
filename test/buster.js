var config = module.exports;

config['sugoroku test'] = {
	rootPath: '../',
	environment: 'browser', // 'browser' or 'node'
	sources: [
		'public/javascripts/StateMachine.js'
	],
	tests: [
		'test/*-test.js'
	]
};