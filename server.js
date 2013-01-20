// Module dependencies.
var express         = require('express'),
    routes          = require('./routes'),
    http            = require('http'),
    path            = require('path'),
    startStopDaemon = require('start-stop-daemon'),
    config          = require('config'),
    ex              = require(__dirname + '/lib/ex');

// configure express server
var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || config.port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger({
		format: ':remote-addr - [:date] ":method :url :http-version" :status ":referrer" ":user-agent"'
	}));
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// set locals
app.locals({
  title: 'sugoroku'
});

// set routing param
app.param('code_name', function (req, res, next, codeName) {
	if (!codeName.match(/^[\w]+$/)) {
		return next(new Error(
			'"' + codeName + '" is invalid code name.'
		));
	}
	next();
});

app.param('code_action', function (req, res, next, codeAction) {
	if (!codeAction) {
		return next();
	}
	if (!codeAction.match(/^[\w]+$/)) {
		return next(new Error(
			'"' + codeAction + '" is invalid code action.'
		));
	}
	req.codeAction = codeAction.slice(1);
	next();
});

app.param('exid', function (req, res, next, exid) {
	if (!ex.exists(exid)) {
		return next(new Error(
			'"' + exid + '" is invalid ex ID.'
		));
	}

	ex.data(exid, function (err, exData) {
		req.params.exData = exData;
		next();
	});
});


// set routing
// app.get('/', routes.index);
app.get('/editor/:code_name', routes.editor);
app.get('/code', routes.index);

app.get('/code/:code_name-:code_action.js', routes.code);
app.get('/code/:code_name.js', routes.code);

app.post('/code/:code_name', routes.postCode);

app.get('/ex/:exid/:exnum', routes.ex);
app.get('/ex', routes.exinit);
app.post('/ex/register', routes.exregister);
app.post('/ex/:exid/next', routes.exnext);

// listen
startStopDaemon(function () {
	http.createServer(app).listen(app.get('port'), function(){
		console.log(
			'Express server listening on port ' + app.get('port')
		);
	});
});
