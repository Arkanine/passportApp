var express      = require('express'),
    favicon      = require('serve-favicon'),
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

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(flash());
app.set('view engine', 'jade');

require('./config/passport')(passport);
app.use(session({ secret: 'secretword' }));
app.use(passport.initialize());
app.use(passport.session());

require('./app/routes')(app, passport);

var port = process.env.PORT || 8080;
app.listen(port);
console.log('Port: ' + port);