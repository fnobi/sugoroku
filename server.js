// Module dependencies.
var express         = require('express'),
    passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy,
    mongoose        = require('mongoose'),
    MongoStore      = require('connect-mongo')(express),
    routes          = require(__dirname + '/routes'),
    http            = require('http'),
    path            = require('path'),
    config          = require('config'),
    alertConfig     = require(__dirname + '/lib/alertConfig');

var models = require(__dirname + '/models');

var User = models.User;
passport.use(new LocalStrategy(
        function(username, password, done) {
                User.findOne(
                        { username: username, password: password },
                        function (err, user) {
                                done(err, user);
                        }
                );
        }
));

passport.serializeUser(function(user, done) {
        done(null, user.username);
});

passport.deserializeUser(function(username, done) {
        User.findOne(
                { username: username },
                function (err, user) {
                        done(err, user);
                }
        );
});

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
        app.use(express.cookieParser());
        app.use(express.session({ secret: config.sessionSecret }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(alertConfig);
        app.use(function (req, res, next) {
                res.locals({
                        user: req.user || null
                });
                next();
        });
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
        app.use(express.errorHandler({
                dumpExceptions: true,
                showStack: true
        }));
});

app.configure('production', function(){
        app.use(express.errorHandler());
});

// set locals
app.locals({
        appname: 'sugoroku',
        alert: {}
});

// set routing param
app.param('user_name', function (req, res, next, userName) {
        if (!userName.match(/^[\w]+$/)) {
                return next(new Error(
                        '"' + userName + '" is invalid user name.'
                ));
        }
        next();
});

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
app.post('/login', routes.login);
app.post('/signup', routes.signup);
app.get('/logout', routes.logout);

app.get('/editor/:user_name/:code_name', routes.editor);
// app.get('/code', routes.index);

app.get('/code/:user_name-:code_name-:code_action.js', routes.code);
app.get('/code/:user_name-:code_name.js', routes.code);

app.post('/code/:user_name/:code_name', routes.postCode);


// daemon processes

// connect to mongoDB
mongoose.connect(
        config.mongodb.host,
        config.mongodb.database
);

// start session store
app.use(express.session({
        secret: config.sessionSecret,
        store: new MongoStore({
                db: config.mongodb.database,
                host: config.mongodb.host,
                clear_interval: 60 * 60
        }),
        cookie: {
                httpOnly: false,
                maxAge: new Date(Date.now() + 60 * 60 * 1000)
                // 60 * 60 * 1000 = 3600000 msec = 1 hour
        }
}));

// listen
http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
});

