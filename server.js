// Module dependencies.
var express = require('express'),
    routes  = require('./routes'),
    http    = require('http'),
    path    = require('path'),
    config  = require('config');


// configure express server
var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || config.port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
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


// set routing
app.get('/', routes.index);
app.get('/editor/:code_name', routes.editor);
app.get('/code', routes.codeIndex);

app.get('/code/:code_name-:code_action.js', routes.code);
app.get('/code/:code_name.js', routes.code);

app.post('/code/:code_name', routes.postCode);

// listen
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
