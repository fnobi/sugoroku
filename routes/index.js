var passport       = require('passport'),
    config         = require('config'),
    models         = require(__dirname + '/../models'),
    User           = models.User,
    codeCollection = require(__dirname + '/../lib/codeCollection');

exports.editor = require(__dirname + '/editor');
exports.code = require(__dirname + '/code');
exports.postCode = require(__dirname + '/postCode');

exports.index = function(req, res){
        console.log(req.user);
        res.render('index', {
                title: 'sugoroku'
        });
};

exports.login = passport.authenticate('local', {
        failureRedirect: config.baseURL + '/?login_fail=1',
        successRedirect: config.baseURL + '/?login_success=1'
});

exports.logout = function(req, res){
        try {
                req.logout();
        } catch (e) {
                res.redirect(config.baseURL + '/?logout_fail=1');
        }
        res.redirect(config.baseURL + '/?logout_success=1');
};

exports.signup = function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        User.findOne({ username: username }, function (err, user) {
                if (err) {
                        throw err;
                }
                if (user) {
                        res.redirect(config.baseURL + '/?signup_fail=1');
                        return;
                }

                var newUser = new User({
                        username: username,
                        password: password
                });

                newUser.save(function (err, user) {
                        if (err) {
                                throw err;
                        }
                        res.redirect(config.baseURL + '/?signup_success=1');
                });
        });
};