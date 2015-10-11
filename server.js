var express      = require('express'),
    favicon      = require('serve-favicon'),
    mongoose     = require('mongoose'),
    passport     = require('passport'),
    flash        = require('connect-flash'),
    morgan       = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    session      = require('express-session'),

    argv         = require('minimist')(process.argv.slice(2)),
    swagger      = require("swagger-node-express");

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

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(flash());
app.set('view engine', 'jade');

require('./config/passport')(passport);
app.use(session({ secret: 'secretword' }));
app.use(passport.initialize());
app.use(passport.session());

var domain = 'localhost';
if(argv.domain !== undefined)
    domain = argv.domain;
var port = 8080;
if(argv.port !== undefined)
    port = argv.port;
var applicationUrl = 'http://' + domain + ':' + port;
require('./swagger/swagger')(app, swagger, applicationUrl);

require('./app/routes')(app,  passport); // password injection

app.listen(port);
console.log('Port: ' + port);