// * Requests related to users

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var UserModel = mongoose.model('user', {
    email: {required: true, unique: true, type:String},
    password: {required: true, type: String},
    username: {required: true, type:String}
});

var user = new UserModel({
    password: 'mishra1234',
    email: 'mishra@mailinator.com',
    username: 'mishrab'
});

var SessionModel = mongoose.model('session', {
    userid: {type: Schema.ObjectId, required: true},
    date: {type: Date, required: true},
    valid: {type: Date, required: true}
});

var session = new SessionModel({
    userid: ObjectId('53f854f5c26951bb2698e4e0'),
    date: new Date(),
    valid: new Date((new Date()).getTime() + 30*60*1000)
});

/*session.save(function (err, session) {
    if (err) console.log(err);
    else console.log(session);
});*/

/*user.save(function (err, result) {
    if (err) console.log(err);
    else console.log(result);
});*/

UserModel.findOne({email: 'dhania@mailinator.com'}, 'password', function(err, user) {
    if (err) console.log(err);
    else console.log(user);
});




var arr_users = [];
var sessions = {};

function checkExisting(req, res, next){
    // this is a middleware, checks for existing user
    UserModel.findOne({email: req.body.email.toLowerCase()}, 'password', function(err, user) {
        if (err) res.json(500, 'Oops.. Something broke!!!');
        else {
            if (typeof user === 'null') {
                // user does not exist
                next();
            } else {
                res.json(409, 'User already exists!')
            }
        }
    });
}

function jsonServerError(res, data){
    res.json(500, {message: 'Oops, something broke!', data: data});
}

function loginRedirect(res){
    res.redirect('/');
}

function sessionCheck(req, res, next){
    if (typeof req.cookies.sessionid !== 'undefined') {
        SessionModel.findOne({_id: ObjectId(req.cookies.sessionid)}, 'userid valid', function(err, session) {
            if(err) {
                console.log(err);
                jsonServerError(res, err.message);
            } else {
                if (typeof session !== 'null' && session.valid > (new Date())) {
                    // console.log('valid session ... \n' + session._id );
                    UserModel.findOne({_id: session.userid}, 'username email', function(err, user) {
                        if (err) {
                            console.log(err);
                            jsonServerError(res, err.message)
                        }
                        else {
                            // attach user to the request
                            req.user = user;
                            next();
                        }
                    });
                } else {

                }
            }
        });
    }
}

function authorize(req, res, next){
    if (typeof req.cookies.sessionid !== null) {
        // sessionid exists -- check if it is valid

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

router.get('/account', sessionCheck, function (req, res){
    console.log(req.user);
    res.render('accounts', req.user);

});

router.get('/sensitive', sessionCheck, function (req, res){
    res.json(200, 'This data is only visible to authenticated users ... ');
});

module.exports = router;