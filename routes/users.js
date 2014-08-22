// * Requests related to users

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');

var arr_users = [];
var sessions = {};

function checkExisting(req, res, next){
    // this is a middleware, checks for existing user
    if((arr_users.map(function (user){
        return user.email;
    })).indexOf(req.body.email) === -1 ) {
        next();
    } else {
        res.json(404, {message: 'User exists'})
    }
}

function authorize(req, res, next){
    if (typeof req.cookies.sessionid !== 'undefined'  &&
        req.cookies.sessionid in sessions) {
        req.user = arr_users[sessions[req.cookies.sessionid].userid];
        next();
    } else {
        res.redirect('/');
    }
}

router.post('/', checkExisting, function (req, res) {
    arr_users.push(req.body);
    // create a session for the user
    var sessionid = uuid.v4();
    sessions[sessionid] = {
        userid: arr_users.length - 1,
        timestamp: new Date()
    };
    res.cookie('sessionid', sessionid);
    res.json(200, { name: req.body.username});
    console.log(sessions);
});

router.get('/account', authorize, function (req, res){
    console.log(req.user);
    res.render('accounts', req.user);

});

router.get('/sensitive', authorize, function (req, res){
    res.json(200, 'This data is only visible to authenticated users ... ');
});

module.exports = router;