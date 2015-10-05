var User = require('../app/models/user');

var login = require('./passport/local.login');
var signUp = require('./passport/local.signup');
var google = require('./passport/google');
var facebook = require('./passport/facebook');
var twitter = require('./passport/twitter');
var linkedin = require('./passport/linkedIn');

module.exports = function (passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', login);
    passport.use('local-signup', signUp);
    passport.use(google);
    passport.use(facebook);
    passport.use(twitter);
    passport.use(linkedin);
};