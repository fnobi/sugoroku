var fs       = require('fs'),
    path     = require('path'),
    util     = require('util'),

    _        = require('underscore'),
    request  = require('request'),
    async    = require('async'),
    config   = require('config'),
    globsync = require('glob-whatev'),

    Code   = require(__dirname + '/Code');

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
			'/javascripts/Action.js',
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
			'/javascripts/Action.js',
			'/javascripts/StateMachine.js',

			'/javascripts/StateMachine-run.js',
			code.url(),
			'/javascripts/run.js'
		];
	}
};

codeCollection.codeNames = function () {
	return _.map(this.codePaths(), function (codePath) {
		return path.basename(codePath, '.json');
	});
};

codeCollection.codePaths = function () {
	return globsync.glob(config.codedir + '/*.json');
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
	fs.readFile(this.filePath(codeName), 'utf8', function (err, res) {
		if (err) {
			return callback(err);
		}
		var code = self.toJS(res);

		var json;
		try {
			json = JSON.parse(res);
		} catch (e) {
			console.error(e);
			return callback(e);
		}
		if (!json.src) {
			return callback(null, code);
		}

		loadSrc(json.src, function (err, res) {
			if (err) {
				return callback(err);
			}
			callback(null, [code, res].join('\n'));
		});
	});
};

var loadSrc = function (src, callback) {
	var texts = [];
	async.forEachSeries(src, function (url, next) {
		if (url.match(/^http/)) {
			request(url, function (err, res, body) {
				if (err) {
					return next(err);
				}
				texts.push(body);
				next();
			});
			return;
		}

		fs.readFile(url, 'utf8', function (err, res) {
			if (err) {
				return next(err);
			}
			texts.push(res);
			next();
		});
	}, function (err) {
		if (err) {
			return callback(err);
		}
		callback(null, texts.join('\n'));
	});
};

codeCollection.publicFile = function (path, callback) {
	fs.readFile(PUBLIC_PATH + path, 'utf8', callback);
};

codeCollection.toJS = function (json) {
	return util.format(
		'var stateMachine = StateMachine.decode(%s);',
		json || '{}'
	);
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

codeCollection.copy = function (original, copy) {
	var filePath = this.filePath(original);
	var copyPath = this.filePath(copy);

	fs.createReadStream(filePath).pipe(
		fs.createWriteStream(copyPath)
	);

	// 実験用機能! publicのファイルも同時にコピーする
	filePath = PUBLIC_PATH + 'demo/' + original + '.html';
	copyPath = PUBLIC_PATH + 'demo/' + copy + '.html';

	var fileContent = fs.readFileSync(filePath, 'utf8');

	fileContent = fileContent.replace(/\/code\/ex-run.js/g, '/code/' + copy + '-run.js');

	fs.writeFileSync(copyPath, fileContent);

	// if (fs.existsSync(filePath)) {
	// 	fs.createReadStream(filePath).pipe(
	// 		fs.createWriteStream(copyPath)
	// 	);
	// }

	// filePath = PUBLIC_PATH + 'src/' + original + '_script.js';
	// copyPath = PUBLIC_PATH + 'src/' + copy + '_script.js';
	// if (fs.existsSync(filePath)) {
	// 	fs.createReadStream(filePath).pipe(
	// 		fs.createWriteStream(copyPath)
	// 	);
	// }

};

module.exports = codeCollection;