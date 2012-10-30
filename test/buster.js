var config = module.exports;

config['sugoroku test'] = {
	rootPath: '../',
	environment: 'browser', // 'browser' or 'node'
	sources: [], // browserテストの場合は必要
	tests: [
		'test/*-test.js'
	]
};