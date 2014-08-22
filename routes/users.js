// * Requests related to users

var express = require('express');
var router = express.Router();

var arr_users = [];
var sessions = [];

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

router.post('/', checkExisting, function (req, res) {
    arr_users.push(req.body);
    // create a session for the user
    sessions.push({
        userid: arr_users.length - 1,
        timestamp: new Date()
    });
    res.cookie('sessionid', sessions.length - 1);
    res.json(200, { name: req.body.username});
});

router.get('/account', function (req, res){
    console.log(typeof req.cookies.sessionid);
    var sessionid = Number(req.cookies.sessionid);
    console.log(typeof sessionid);
    // get the session
    // get the userid from the session
    // send the details back to the page
    res.render('accounts', arr_users[sessions[sessionid].userid]);

});

module.exports = router;