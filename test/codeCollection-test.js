var util   = require('util'),
    buster = require('buster'),
    codeCollection = require(__dirname + '/../lib/codeCollection');

buster.testCase('codeCollection', {
	'.url': function () {
		assert.equals(
			codeCollection.url('hoge', 'moge'),
			'/codes/hoge-moge.js'
		);

		assert.equals(
			codeCollection.url('hogehoge'),
			'/codes/hogehoge.js'
		);
	}
});