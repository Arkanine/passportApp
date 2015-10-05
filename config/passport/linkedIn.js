var LinkedInStrategy = require('passport-linkedin').Strategy,
    configAuth = require('../auth'),
    User = require('../../app/models/user');

module.exports = new LinkedInStrategy({
        consumerKey: configAuth.linkedInAuth.consumerKey,
        consumerSecret: configAuth.linkedInAuth.consumerSecret,
        callbackURL: configAuth.linkedInAuth.callbackURL,
        passReqToCallback : true,
        profileFields: ['id', 'first-name', 'last-name', 'email-address', 'picture-url', 'headline', 'location', 'specialties']
    },
    function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if(!req.user) {
                User.findOne({ 'linkedIn.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        if (!user.google.token) {
                            user.linkedIn.token = token;
                            user.linkedIn.familyName = profile.name.familyName;
                            user.linkedIn.givenName = profile.name.givenName;
                            user.linkedIn.email = profile.emails[0].value;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();
                        newUser.linkedIn.id    = profile.id;
                        newUser.linkedIn.token = token;
                        newUser.linkedIn.familyName = profile.name.familyName;
                        newUser.linkedIn.givenName = profile.name.givenName;
                        newUser.linkedIn.email = profile.emails[0].value;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                var user            = req.user; // pull the user out of the session

                user.linkedIn.id    = profile.id;
                user.linkedIn.token = token;
                user.linkedIn.familyName = profile.name.familyName;
                user.linkedIn.givenName = profile.name.givenName;
                user.linkedIn.email = profile.emails[0].value;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    });