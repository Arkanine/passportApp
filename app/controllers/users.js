var Users = require('../models/user');

exports.getAllUsers = function(req, res) {
    Users.find(function(err, users) {
        if(err) {
            res.send(err);
        }
        res.json(users);
    });
};