var fs     = require('fs'),
    path   = require('path'),
    util   = require('util'),

    config = require('config'),
    async  = require('async'),

    Code   = require('Code');


var codeCollection = {};

var PUBLIC_PATH = __dirname + '/../public/';

codeCollection.actions = {
	editor: function (code) {
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
			code.url(),
			'/javascripts/editor.js'
		];
	},
	run: function (code) {
		return [
			'/javascripts/jquery-1.8.2.js',

			'/javascripts/State.js',
			'/javascripts/Condition.js',
			'/javascripts/Transition.js',
			'/javascripts/StateMachine.js',

			'/javascripts/StateMachine-run.js',
			code.url(),
			'/javascripts/run.js'
		];
	}
};

codeCollection.filePath = function (codeName) {
	return new Code(codeName).filePath();
};

codeCollection.url = function (codeName, codeAction) {
	return new Code(codeName).url(codeAction);
};

codeCollection.exists = function (codeName) {
	return new Code(codeName).exists();
};

codeCollection.codeText = function (codeName, codeAction, callback) {
	if (codeAction) {
		this.codeConcat(codeName, codeAction, callback);
		return;
	}

	var self = this;
	fs.readFile(
		this.filePath(codeName),
		'utf8',
		function (err, res) {
			if (err) {
				return callback(err, null);
			}

			callback(null, self.toJS(res));
		}
	);
};

codeCollection.publicFile = function (path, callback) {
	fs.readFile(PUBLIC_PATH + path, 'utf8', callback);
};

codeCollection.toJS = function (json) {
	return util.format('var stateRoot = %s;', json || '{}');
};

codeCollection.codeConcat = function (codeName, codeAction, callback) {
	var self = this;
	var queue = this.actions[codeAction](new Code(codeName));
	var result = [];

	async.forEachSeries(queue, function (url, next) {
		var done = function (err, res) {
			if (err) {
				return next(err);
			}

			result.push(res);
			next();
		};

		if (url == self.url(codeName)) {
			self.codeText(codeName, null, done);
			return;
		}

		self.publicFile(url, done);

	}, function (err) {
		callback(err, result.join('\n\n'));
	});
};

codeCollection.save = function (codeName, definition, callback) {
	var filePath = this.filePath(codeName);
	fs.writeFile(filePath, definition, callback);
};

module.exports = codeCollection;