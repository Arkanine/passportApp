var express      = require('express'),
    favicon      = require('static-favicon'),
    mongoose     = require('mongoose'),
    passport     = require('passport'),
    flash        = require('connect-flash'),
    morgan       = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    session      = require('express-session');

var app          = express(),
    server       = require('http').Server(app),
    io           = require('socket.io')(server);


// Connect to mongodb
var configDB = require('./config/database.js');
var connect = function () {
    mongoose.connect(configDB.url, configDB.options);
};
connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

//var stripe = require("stripe")("sk_test_72FX8WSRUD9ojDFW2jkzfBrr");
//var stripeToken = request.body.stripeToken;
//console.log(stripeToken);

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(favicon());
app.use(flash()); // use connect-flash for flash messages stored in session
app.set('view engine', 'jade'); // set up jade for templating

// required for passport
require('./config/passport')(passport); // pass passport for configuration
app.use(session({ secret: 'secretword' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// routes ======================================================================
require('./app/routes')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var port = process.env.PORT || 8080;
app.listen(port);
console.log('Port: ' + port);