var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    RememberMeStrategy = require('passport-remember-me').Strategy,
    loginChecker = require('connect-ensure-login'),
    md5 = require('md5');

var users = {
  idubov: {
    username: 'idubov',
    hash: '25b0fcbff88a37c00310667069a13251'
  }
};
passport.use(new LocalStrategy(
    function(username, password, done) {
      var user = users[username];
      if (user && user.hash === md5(password)) return done(null, user);
      else return done(null, false, {message: 'Incorrect password or username.'});
    }
));

passport.use(new RememberMeStrategy(
    function(token, done) {
        Token.consume(token, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    },
    function(user, done) {
        var token = md5('waste' + new Date());
        Token.save(token, user, function(err) {
            if (err) { return done(err); }
            return done(null, token);
        });
    }
));


passport.serializeUser(function(user, cb) {
  cb(null, user.username);
});
passport.deserializeUser(function(username, cb) {
  cb(null, users[username]);
});

var db = require('./db.js');

var app = express();

var router = express.Router();

router.get('/', loginChecker.ensureLoggedIn(), function(req, res) {
  res.sendFile(path.join(__dirname, 'public/main.html'));
});

router.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});
/*router.post('/login', passport.authenticate('local', {failureRedirect: '/login?error'}), function(req, res) {
  res.redirect('/');
});*/

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login'}),
    function(req, res, next) {

        var token = md5('waste' + new Date());
            Token.save(token, req.username, function(err) {
            if (err) { return done(err); }
            res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
            return next();
        });
    },
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function(req, res) {
  req.logOut();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

router.post('/api/waste', loginChecker.ensureLoggedIn(), function(req, res) {
    var waste = req.body;
    waste.dateAdded = new Date();
    db.get('waste').insert(req.body, function() {
        res.sendStatus(201);
    });
});
router.get('/api/waste', loginChecker.ensureLoggedIn(), function(req, res) {
    db.get('waste').find().then(function(wastes) {
        res.send(wastes);
    });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({secret: 'lsadkjflksadjf;lkajshdf', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(router);

var Token = (function() {
    var tokens = {};
    return {
        consume: function (token, cb) {
            if (tokens[token]) cb(null, tokens[token]);
            else cb ('no such user', null);
        },
        save: function(token, username, cb) {
            tokens[token] = users[username];
            cb(null);
        }
    }
})();

module.exports = app;
