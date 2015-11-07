var util = require('util');
function debug(title, data){
    console.log(title + ": " + util.inspect(data, false, null));
}

var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
// + npm install hbs
var passport = require('passport');

// ORMhez importált modulok
var Waterline = require('waterline');
var waterlineConfig = require('./config/waterline');
// ORM példány
var orm = new Waterline();
var userCollection = require('./models/user');
var subjectCollection = require('./models/subject');
var csatCollection = require('./models/csat');
orm.loadCollection(Waterline.Collection.extend(userCollection));
orm.loadCollection(Waterline.Collection.extend(subjectCollection));
orm.loadCollection(Waterline.Collection.extend(csatCollection));

var loginController = require('./controllers/login');
var subjectController = require('./controllers/subject');
var app = express();

//config
app.set('views', './views');
app.set('view engine', 'hbs');

//middlewares
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session({
    cookie: {
        maxAge  : new Date(Date.now() + 3600000), //1 Hour
        expires : new Date(Date.now() + 3600000), //1 Hour
    },
    secret  : "Stays my secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize()); //Passport middlewares
app.use(passport.session()); //Session esetén (opcionális)

passport.serializeUser(function(user, done) {
    //debug('serializeUser',user);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    //debug('serializeUser',obj);
    done(null, obj);
})

var LocalStrategy = require('passport-local').Strategy;

// Local Strategy for sign-up
passport.use('local-signup', new LocalStrategy({
        usernameField: 'mtra',
        passwordField: 'password',
        passReqToCallback: true,
    },
    function(req, mtra, password, done) {
        
        req.app.models.user.findOne({ mtra: mtra }, function(err, user) {
            if (err) { return done(err); }
            if (user) {
                return done(null, false, { message: 'Létező MTR-azonosító.' });
            }
            req.app.models.user.create(req.body)
            .then(function (user) {
                return done(null, user);
            })
            .catch(function (err) {
                return done(null, false, { message: err.details });
            })
        });
    }
));

// Stratégia
passport.use('local-login', new LocalStrategy({
        usernameField: 'mtra',
        passwordField: 'password',
        passReqToCallback: true,
    },
    function(req, mtra, password, done) {
        debug('local-login',req.body);
        req.app.models.user.findOne({ mtra: mtra }, function(err, user) {
            if (err) { return done(err); }
            if (!user || !user.validPassword(password)) {
                return done(null, false, { message: 'Helytelen adatok.' });
            }
            return done(null, user);
        });
    }
));

function setLocalsForLayout() {
    return function (req, res, next) {
        res.locals.loggedIn = req.isAuthenticated();
        res.locals.user = req.user;
        next();
    }
}
app.use(setLocalsForLayout());
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

//endpoints
app.use('/', loginController);
app.use('/subjects', ensureAuthenticated, subjectController);
app.use('/login', loginController);


function andRestrictTo(role) {
    return function(req, res, next) {
        if (req.user.role == role) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    }
}

// ORM indítása
orm.initialize(waterlineConfig, function(err, models) {
    if(err) throw err;
    
    app.models = models.collections;
    app.connections = models.connections;
    
    // Start Server
    var port = process.env.PORT || 3000;
    app.listen(port, function () {
        console.log('Server is started.');
    });
    
    console.log("ORM is started.");
});


