// controllers/login.js

var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('login/login', {
        errorMessages: req.flash()
    });
});

router.get('/login', function (req, res) {
    res.render('login/login', {
        errorMessages: req.flash()
    });
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.post('/', passport.authenticate('local-login', {
    successRedirect: '/subjects/list',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'Hiányzó adatok'
}));

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/subjects/list',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'Hiányzó adatok'
}));

router.get('/signup', function (req, res) {
    res.render('login/signup', {
        errorMessages: req.flash()
    });
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/login/signup',
    failureFlash: true,
    badRequestMessage: 'Hiányzó adatok'
}));

module.exports = router;