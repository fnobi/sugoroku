var config = require('config'),
    fs     = require('fs'),
    path   = require('path'),
    async  = require('async');

var codeCollection = {};

var PUBLIC_PATH = __dirname + '/../public/';

codeCollection.actions = {
	editor: function (codeName) {
		return [
			'/javascripts/jquery-1.8.2.js',

			'/javascripts/jquery.ui.core.js',
			'/javascripts/jquery.ui.widget.js',
			'/javascripts/jquery.ui.mouse.js',
			'/javascripts/jquery.ui.draggable.js',
			// '/javascripts/jquery.ui.droppable.js',

			'/javascripts/State.js',
			'/javascripts/Condition.js',
			'/javascripts/Transition.js',
			'/javascripts/StateMachine.js',

			'/javascripts/StateMachine-editor.js',
			codeCollection.url(codeName),
			'/javascripts/editor.js'
		];
	},
	run: function (codeName) {
		return [
			'/javascripts/jquery-1.8.2.js',

			'/javascripts/State.js',
			'/javascripts/Condition.js',
			'/javascripts/Transition.js',
			'/javascripts/StateMachine.js',

			'/javascripts/StateMachine-run.js',
			codeCollection.url(codeName),
			'/javascripts/run.js'
		];
	}
};

codeCollection.filePath = function (codeName) {
	return __dirname + '/../codes/' + codeName + '.json';
};

codeCollection.exists = function (codeName) {
	return (fs.exists ? fs : path).existsSync(
		this.filePath(codeName)
	);
};

codeCollection.url = function (codeName, codeAction) {
	return '/codes/' +
		codeName +
		(codeAction ? ('-' + codeAction) : '') +
		'.js';
};

codeCollection.codeText = function (codeName, codeAction, callback) {
	if (codeAction) {
		this.codeConcat(codeName, codeAction, callback);
		return;
	}

	var self = this;
	fs.readFile(
		this.filePath(codeName), 'utf8',
		function (err, res) {
			callback(
				err,
				res ? self.toJS(res) : null
			);
		}
	);
};

codeCollection.publicFile = function (path, callback) {
	fs.readFile(PUBLIC_PATH + path, 'utf8', callback);
};

codeCollection.toJS = function (json) {
	return 'var stateRoot = ' + json + ';';
};

codeCollection.codeConcat = function (codeName, codeAction, callback) {
	var self = this;
	var queue = this.actions[codeAction](codeName);
	var result = '';

	async.forEachSeries(queue, function (url, callback) {
		var done = function (err, res) {
			result += res + '\n\n';
			callback(err);
		};

		if (url == self.url(codeName)) {
			self.codeText(codeName, null, done);
			return;
		}

		self.publicFile(url, done);

	}, function (err) {
		callback(err, result);
	});
};

module.exports = codeCollection;