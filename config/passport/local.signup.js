var LocalStrategy = require('passport-local').Strategy,
    User = require('../../app/models/user');

module.exports = new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, existingUser) {
                if (err)
                    return done(err);
                if (existingUser) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                }
                if(req.user) {
                    var user            = req.user;
                    user.local.email    = email;
                    user.local.password = user.generateHash(password);
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
                else {
                    var newUser            = new User();
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    });