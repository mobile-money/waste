var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
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

router.post('/login', passport.authenticate('local', {failureRedirect: '/login?error'}), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logOut();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

router.post('/api/waste', loginChecker.ensureLoggedIn(), function(req, res) {
    db.get('waste').insert(req.body, function() {
        res.sendStatus(201);
    });
});
router.get('/api/waste', loginChecker.ensureLoggedIn(), function(req, res) {
    db.get('waste').find().then(function(wastes) {
        res.send(wastes);
    });
});
router.put('/api/waste/:wasteId', loginChecker.ensureLoggedIn(), function(req, res) {
    db.get('waste').update(req.params.wasteId, req.body, function() {
        res.sendStatus(200);
    });
});
router.delete('/api/waste/:wasteId', loginChecker.ensureLoggedIn(), function(req, res) {
    db.get('waste').remove(req.params.wasteId, function() {
        res.sendStatus(204);
    });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({secret: 'lsadkjflksadjf;lkajshdf', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(router);

module.exports = app;
