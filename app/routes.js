module.exports = function(app, passport) {
    var crypto       = require('crypto');
    var async        = require('async');
    var nodemailer   = require('nodemailer');
    var User         = require('../app/models/user');
    var stripe       = require('stripe')('sk_test_72FX8WSRUD9ojDFW2jkzfBrr');
    var notifier     = require('node-notifier');
    var path         = require('path');

    // HOME PAGE (with login links) ========
    app.get('/', function(req, res) {
        res.render('index.jade'); // load the index.ejs file
    });

    // PROFILE SECTION =====================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.jade', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.post('/profile/charge', function(req, res, next) {
        stripe.charges.create({
            amount: 100,
            currency: 'usd',
            source: req.body.stripeToken,
            description: 'One time deposit for ' + req.user.email + '.'
        }, function(err, charge) {
            if (err) return next(err);

            console.log(req.user);
            console.log(charge);

            //User.findOne({ 'local.email' : req.user.local.email }, function(err, user) {});

            req.user.local.balance = req.user.local.balance ? req.user.local.balance : 0;
            req.user.local.balance += charge.amount;
            req.user.save(function(err) {
                if (err) return next(err);
                res.redirect('/profile');
            });
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
// locally ---------------------------------
    // LOGIN ===============================
    app.get('/login', function(req, res) {
        res.render('login.jade', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // SIGNUP ==============================
    app.get('/signup', function(req, res) {
        res.render('signup.jade', { message: req.flash('signupMessage') });
        console.log('SignUp message: ' + req.flash('signupMessage'));
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

// networks --------------------------------
    // FACEBOOK ROUTES =====================
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // TWITTER ROUTES ======================
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // GOOGLE ROUTES =======================
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // LINKED IN ROUTES ====================
    app.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));

    app.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', {
            successRedirect : '/profile',
            failureRedirect: '/'
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================
// locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.jade', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

// networks -----------------------------------
    // facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // twitter --------------------------------
    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // google ---------------------------------
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // linkedIn ---------------------------------
    // send to google to do the authentication
    app.get('/connect/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));

    app.get('/connect/linkedin/callback',
        passport.authenticate('linkedin', {
            successRedirect : '/profile',
            failureRedirect: '/'
        }));


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

// local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

// networks -----------------------------------
    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // linkedIn ---------------------------------
    app.get('/unlink/linkedin', function(req, res) {
        var user            = req.user;
        user.linkedIn.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


// =============================================================================
// RESET PASSWORD ==============================================================
// =============================================================================
    app.get('/forgot', function(req, res) {
        res.render('forgot.jade', {
            message: req.flash('info'),
            user: req.user
        });
    });

    app.post('/forgot', function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ 'local.email': req.body.email }, function(err, user) {
                    if (!user) {
                        req.flash('info', 'No account with that email address exists.');
                        return res.redirect('/forgot');
                    }

                    user.local.resetPasswordToken = token;
                    user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var transport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'rozabi@pascalium.com',
                        pass: 'gf765bv21'
                    }
                });
                var mailOptions = {
                    to: user.local.email,
                    from: 'rozabi@pascalium.com',
                    subject: 'Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

                transport.sendMail(mailOptions, function(err) {
                    console.log('An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);

            // NOTIFIER
            console.log('noifier test');
            notifier.notify({
                title: 'My awesome title',
                message: 'Hello from node, Mr. User!',
                icon: path.join(__dirname, '../pen.png'), // absolute path (not balloons)
                sound: 'Funk', // Only Notification Center or Windows Toasters
                wait: true // wait with callback until user action is taken on notification
            }, function (err, response) {
                // response is response from notification
                console.log(response);
            });

            req.flash('info', 'An e-mail has been sent with further instructions.');
            res.redirect('/forgot');
        });
    });

    app.get('/reset/:token', function(req, res) {
        User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
            if (!user) {
                console.log('Password reset token is invalid or has expired.');
                return res.redirect('/forgot');
            }
            res.render('reset.jade', {
                user: req.user
            });
        });
    });

    app.post('/reset/:token', function(req, res) {
        async.waterfall([
            function(done) {
                User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }

                    user.local.password = user.generateHash(req.body.password);
                    user.local.resetPasswordToken = undefined;
                    user.local.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                });
            },
            function(user, done) {
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'Gmail',
                    auth: {
                        user: 'rozabi@pascalium.com',
                        pass: 'gf765bv21'
                    }
                });
                var mailOptions = {
                    to: user.local.email,
                    from: 'zabila.r@a.ru',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    console.log('Success! Your password has been changed.');
                    done(err);
                });
            }
        ], function(err) {
            res.redirect('/');
        });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}