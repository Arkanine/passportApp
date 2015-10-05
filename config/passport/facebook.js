var FacebookStrategy = require('passport-facebook').Strategy,
    configAuth = require('../auth'),
    User = require('../../app/models/user');

module.exports = new FacebookStrategy({
        clientID          : configAuth.facebookAuth.clientID,
        clientSecret      : configAuth.facebookAuth.clientSecret,
        callbackURL       : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true,
        profileFields: ["emails", "displayName"]
    },
    function(req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.displayName;
                            user.facebook.email = profile.emails[0].value;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser            = new User();

                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                var user            = req.user; // pull the user out of the session

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.displayName;
                user.facebook.email = profile.emails[0].value;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    });