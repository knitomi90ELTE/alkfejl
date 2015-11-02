// controllers/subject.js
var express = require('express');
var router = express.Router();

//Viewmodel réteg
var statusTexts = {
    'available': 'Jelentkezhet',
    'inavailable': 'Nem jelentkezhet',
    'passive': 'Passzív',
};
var statusClasses = {
    'available': 'success',
    'inavailable': 'danger',
    'passive': 'info',
};

function decorateSubjects(subjectContainer) {
    return subjectContainer.map(function (e) {
        e.statusText = statusTexts[e.status];
        e.statusClass = statusClasses[e.status];
        return e;
    });
}

router.get('/list', function (req, res) {
    req.app.models.subject.find().then(function (subjects) {
        console.log(subjects);
        //megjelenítés
        res.render('subjects/list', {
            errors: decorateSubjects(subjects),
            messages: req.flash('info'),
        });
    });
});
router.get('/new', function (req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('subjects/new', {
        validationErrors: validationErrors,
        data: data,
    });
});
router.post('/new', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('terem', 'Hibás helyszín').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('description').escape();
    req.checkBody('description', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/subjects/new');
    }
    else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        req.app.models.subject.create({
            status: 'new',
            room: req.body.room,
            description: req.body.description
        })
        .then(function (subject) {
            req.flash('info', 'Hiba sikeresen felvéve!');
            res.redirect('/subjects/list');
        })
        .catch(function (err) {
            console.log(err);
        });
    }
});

module.exports = router;