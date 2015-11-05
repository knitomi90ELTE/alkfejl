// controllers/subject.js
var express = require('express');
var router = express.Router();

var util = require('util');
function debug(title, data){
    console.log(title + ": " + util.inspect(data, false, null));
}

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
        debug('req.user',req.user);
        //debug('subjects',subjects);
        //megjelenítés
        
        if(req.user.role == "teacher"){
            res.render('subjects/list_teacher', {
                errors: decorateSubjects(subjects),
                messages: req.flash('info'),
            });
        }else{
            res.render('subjects/list', {
                errors: decorateSubjects(subjects),
                messages: req.flash('info'),
            });
        }
    });
});
router.get('/new', function (req, res) {
    //debug('req.app',req.body);
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('subjects/new', {
        validationErrors: validationErrors,
        data: data,
    });
});
router.post('/new', function (req, res) {
    // adatok ellenőrzése
    //debug('/new req',req.body);
    req.checkBody('subjectName', 'Nem adtál meg tárgynevet!').notEmpty().withMessage('Kötelező megadni!');
    req.checkBody('room', 'Nem adtál meg helyszínt!').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('description').escape();
    req.checkBody('description', 'Nem adtál meg leírást!').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/subjects/new');
    } else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        
        req.app.models.subject.create({
            status: req.body.status,
            subjectName: req.body.subjectName,
            room: req.body.room,
            description: req.body.description
        })
        .then(function (subject) {
            req.flash('info', 'Tantárgy sikeresen felvéve!');
            res.redirect('/subjects/list');
        })
        .catch(function (err) {
            console.log(err);
        });
    }
});

module.exports = router;