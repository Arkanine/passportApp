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

/**
 * Swagger
 */
var models  = require('./swagger/models/models'),
    test    = require('./swagger/models/test');

app.use('/js', express.static('swagger/js'));
app.use('/lib', express.static('swagger/lib'));
app.use('/css', express.static('swagger/css'));
app.use('/images', express.static('swagger/images'));
// Set the main handler in swagger to the express app
swagger.setAppHandler(app);
// Adding models and methods to our RESTFul service
swagger.addModels(models)
    .addGet(test.dummyTestMethod);
// set api info
swagger.setApiInfo({
    title: "KnowlegeBS API",
    description: "API to manage job applications",
    termsOfServiceUrl: "",
    contact: "rozabi@pascalium.com",
    license: "",
    licenseUrl: ""
});

app.get('/api-doc', function (req, res) {
    res.sendfile('swagger/swagger.html');
});

swagger.configureSwaggerPaths('', 'api-docs', '');

var domain = 'localhost';
if(argv.domain !== undefined)
    domain = argv.domain;
else
    console.log('No --domain=xxx specified, taking default hostname "localhost".');

var port = 8080;
if(argv.port !== undefined)
    port = argv.port;
else
    console.log('No --port=xxx specified, taking default port ' + port + '.');

var applicationUrl = 'http://' + domain + ':' + port;
console.log('Knowlege BS API running on ' + applicationUrl);

swagger.configure(applicationUrl, '1.0.0');

require('./app/routes')(app, passport); // password injection

//var port = process.env.PORT || 8080;
app.listen(port);
console.log('Port: ' + port);