// controllers/index.js

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    if(req.isAuthenticated()){
        res.redirect('subjects/list');
    } else {
        res.redirect('/login');
        //res.redirect('login');
    }
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


module.exports = router;