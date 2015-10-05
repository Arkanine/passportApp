//// load all the things we need
//var LocalStrategy = require('passport-local').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy;
//var TwitterStrategy  = require('passport-twitter').Strategy;
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var LinkedInStrategy = require('passport-linkedin').Strategy;
//// load up the user model
//var User = require('../app/models/user');
//// load the auth variables
//var configAuth = require('./auth');


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



//module.exports = function(passport) {
//    passport.serializeUser(function(user, done) {
//        done(null, user.id);
//    });
//    // used to deserialize the user
//    passport.deserializeUser(function(id, done) {
//        User.findById(id, function(err, user) {
//            done(err, user);
//        });
//    });
//
//    // =========================================================================
//    // LOCAL LOGIN =============================================================
//    // =========================================================================
//    passport.use('local-login', new LocalStrategy({
//            usernameField : 'email',
//            passwordField : 'password',
//            passReqToCallback : true // allows us to pass back the entire request to the callback
//        },
//        function(req, email, password, done) { // callback with email and password from our form
//            User.findOne({ 'local.email' :  email }, function(err, user) {
//                if (err)
//                    return done(err);
//                if (!user)
//                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
//                if (!user.validPassword(password))
//                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
//                return done(null, user);
//            });
//
//        }));
//
//    // =========================================================================
//    // LOCAL SIGNUP ============================================================
//    // =========================================================================
//    passport.use('local-signup', new LocalStrategy({
//            usernameField : 'email',
//            passwordField : 'password',
//            passReqToCallback : true // allows us to pass back the entire request to the callback
//        },
//        function(req, email, password, done) {
//            process.nextTick(function() {
//                User.findOne({ 'local.email' :  email }, function(err, existingUser) {
//                    if (err)
//                        return done(err);
//                    if (existingUser) {
//                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
//                    }
//                    if(req.user) {
//                        var user            = req.user;
//                        user.local.email    = email;
//                        user.local.password = user.generateHash(password);
//                        user.save(function(err) {
//                            if (err)
//                                throw err;
//                            return done(null, user);
//                        });
//                    }
//                    else {
//                        var newUser            = new User();
//                        newUser.local.email    = email;
//                        newUser.local.password = newUser.generateHash(password);
//
//                        newUser.save(function(err) {
//                            if (err)
//                                throw err;
//                            return done(null, newUser);
//                        });
//                    }
//                });
//            });
//        }));
//
//    // =========================================================================
//    // FACEBOOK ================================================================
//    // =========================================================================
//    passport.use(new FacebookStrategy({
//            clientID          : configAuth.facebookAuth.clientID,
//            clientSecret      : configAuth.facebookAuth.clientSecret,
//            callbackURL       : configAuth.facebookAuth.callbackURL,
//            passReqToCallback : true,
//            profileFields: ["emails", "displayName"]
//        },
//        function(req, token, refreshToken, profile, done) {
//            // asynchronous
//            process.nextTick(function() {
//                if (!req.user) {
//                    User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
//                        if (err)
//                            return done(err);
//                        if (user) {
//                            if (!user.facebook.token) {
//                                user.facebook.token = token;
//                                user.facebook.name  = profile.displayName;
//                                user.facebook.email = profile.emails[0].value;
//
//                                user.save(function(err) {
//                                    if (err)
//                                        throw err;
//                                    return done(null, user);
//                                });
//                            }
//
//                            return done(null, user);
//                        } else {
//                            var newUser            = new User();
//
//                            newUser.facebook.id    = profile.id; // set the users facebook id
//                            newUser.facebook.token = token; // we will save the token that facebook provides to the user
//                            newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
//                            newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
//
//                            newUser.save(function(err) {
//                                if (err)
//                                    throw err;
//                                return done(null, newUser);
//                            });
//                        }
//                    });
//                } else {
//                    var user            = req.user; // pull the user out of the session
//
//                    user.facebook.id    = profile.id;
//                    user.facebook.token = token;
//                    user.facebook.name  = profile.displayName;
//                    user.facebook.email = profile.emails[0].value;
//
//                    user.save(function(err) {
//                        if (err)
//                            throw err;
//                        return done(null, user);
//                    });
//                }
//            });
//        }));
//
//    // =========================================================================
//    // TWITTER =================================================================
//    // =========================================================================
//    passport.use(new TwitterStrategy({
//
//            consumerKey       : configAuth.twitterAuth.consumerKey,
//            consumerSecret    : configAuth.twitterAuth.consumerSecret,
//            callbackURL       : configAuth.twitterAuth.callbackURL,
//            passReqToCallback : true
//
//        },
//        function(req, token, tokenSecret, profile, done) {
//            process.nextTick(function() {
//                if (!req.user) {
//                    User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
//                        if (err)
//                            return done(err);
//                        if (user) {
//                            if (!user.twitter.token) {
//                                user.twitter.token       = token;
//                                user.twitter.username    = profile.username;
//                                user.twitter.displayName = profile.displayName;
//
//                                user.save(function(err) {
//                                    if (err)
//                                        throw err;
//                                    return done(null, user);
//                                });
//                            }
//
//                            return done(null, user);
//                        } else {
//                            var newUser                 = new User();
//
//                            newUser.twitter.id          = profile.id;
//                            newUser.twitter.token       = token;
//                            newUser.twitter.username    = profile.username;
//                            newUser.twitter.displayName = profile.displayName;
//
//                            newUser.save(function(err) {
//                                if (err)
//                                    throw err;
//                                return done(null, newUser);
//                            });
//                        }
//                    });
//                } else {
//                    var user            = req.user; // pull the user out of the session
//
//                    user.twitter.id          = profile.id;
//                    user.twitter.token       = token;
//                    user.twitter.username    = profile.username;
//                    user.twitter.displayName = profile.displayName;
//
//                    user.save(function(err) {
//                        if (err)
//                            throw err;
//                        return done(null, user);
//                    });
//                }
//            });
//        }));
//
//    // =========================================================================
//    // GOOGLE ==================================================================
//    // =========================================================================
//    passport.use(new GoogleStrategy({
//            clientID          : configAuth.googleAuth.clientID,
//            clientSecret      : configAuth.googleAuth.clientSecret,
//            callbackURL       : configAuth.googleAuth.callbackURL,
//            passReqToCallback : true
//        },
//        function(req, token, refreshToken, profile, done) {
//            process.nextTick(function() {
//                if(!req.user) {
//                    User.findOne({ 'google.id' : profile.id }, function(err, user) {
//                        if (err)
//                            return done(err);
//                        if (user) {
//                            if (!user.google.token) {
//                                user.google.token = token;
//                                user.google.name  = profile.displayName;
//                                user.google.email = profile.emails[0].value;
//
//                                user.save(function(err) {
//                                    if (err)
//                                        throw err;
//                                    return done(null, user);
//                                });
//                            }
//
//                            return done(null, user);
//                        } else {
//                            var newUser          = new User();
//
//                            newUser.google.id    = profile.id;
//                            newUser.google.token = token;
//                            newUser.google.name  = profile.displayName;
//                            newUser.google.email = profile.emails[0].value; // pull the first email
//
//                            newUser.save(function(err) {
//                                if (err)
//                                    throw err;
//                                return done(null, newUser);
//                            });
//                        }
//                    });
//                } else {
//                    var user            = req.user; // pull the user out of the session
//
//                    user.google.id    = profile.id;
//                    user.google.token = token;
//                    user.google.name  = profile.displayName;
//                    user.google.email = profile.emails[0].value;
//
//                    user.save(function(err) {
//                        if (err)
//                            throw err;
//                        return done(null, user);
//                    });
//                }
//            });
//
//        }));
//
//    // =========================================================================
//    // LINKED IN ===============================================================
//    // =========================================================================
//    passport.use(new LinkedInStrategy({
//            consumerKey: configAuth.linkedInAuth.consumerKey,
//            consumerSecret: configAuth.linkedInAuth.consumerSecret,
//            callbackURL: configAuth.linkedInAuth.callbackURL,
//            passReqToCallback : true,
//            profileFields: ['id', 'first-name', 'last-name', 'email-address', 'picture-url', 'headline', 'location', 'specialties']
//        },
//        function(req, token, tokenSecret, profile, done) {
//            process.nextTick(function() {
//                if(!req.user) {
//                    User.findOne({ 'linkedIn.id' : profile.id }, function(err, user) {
//                        if (err)
//                            return done(err);
//                        if (user) {
//                            if (!user.google.token) {
//                                user.linkedIn.token = token;
//                                user.linkedIn.familyName = profile.name.familyName;
//                                user.linkedIn.givenName = profile.name.givenName;
//                                user.linkedIn.email = profile.emails[0].value;
//
//                                user.save(function(err) {
//                                    if (err)
//                                        throw err;
//                                    return done(null, user);
//                                });
//                            }
//
//                            return done(null, user);
//                        } else {
//                            var newUser          = new User();
//                            newUser.linkedIn.id    = profile.id;
//                            newUser.linkedIn.token = token;
//                            newUser.linkedIn.familyName = profile.name.familyName;
//                            newUser.linkedIn.givenName = profile.name.givenName;
//                            newUser.linkedIn.email = profile.emails[0].value;
//
//                            newUser.save(function(err) {
//                                if (err)
//                                    throw err;
//                                return done(null, newUser);
//                            });
//                        }
//                    });
//                } else {
//                    var user            = req.user; // pull the user out of the session
//
//                    user.linkedIn.id    = profile.id;
//                    user.linkedIn.token = token;
//                    user.linkedIn.familyName = profile.name.familyName;
//                    user.linkedIn.givenName = profile.name.givenName;
//                    user.linkedIn.email = profile.emails[0].value;
//
//                    user.save(function(err) {
//                        if (err)
//                            throw err;
//                        return done(null, user);
//                    });
//                }
//            });
//        }
//    ));
//};



