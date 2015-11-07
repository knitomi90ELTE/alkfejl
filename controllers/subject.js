// controllers/subject.js
var express = require('express');
var router = express.Router();

var util = require('util');
function debug(title, data){
    console.log(title + ": " + util.inspect(data, false, null));
}

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

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

router.get('/list', function (req, res) {
    console.log('listreferer' + req.headers.referer);
    debug('list get', req.body);
    req.app.models.subject.find().then(function (subjects) {

        var view = (req.user.role == "teacher") ? 'subjects/list_teacher' : 'subjects/list';
        
        res.render(view, {
            errors: decorateSubjects(subjects),
            messages: req.flash('info'),
            subjects: subjects.filter(function(item) {
                return item.user == req.user.id;   
            })
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

    req.checkBody('subjectName', 'Nem adtál meg tárgynevet!').notEmpty().withMessage('Kötelező megadni!');
    req.checkBody('room', 'Nem adtál meg helyszínt!').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('description').escape();
    req.checkBody('description', 'Nem adtál meg leírást!').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    debug('validationErrors',validationErrors)
    
    if (validationErrors) {
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('new');
    } else {
        
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

router.get('/delete/:id', ensureAuthenticated, function(req, res) {
    debug('delete',req.params);
    req.app.models.subject.destroy({
        id: req.params.id
    })
    .then(function() {
        req.flash('info', 'Tantárgy sikeresen törölve!');
        res.redirect('list');
    })
    .catch(function (err) {
        console.log(err);
    });
});

router.get('/modify/:id', ensureAuthenticated, function(req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var mod_id = (req.flash('mod_id') || [{}]).pop();
    var finalId = (mod_id) ? mod_id : req.params.id;
    
    req.app.models.subject.findOne({
        id: finalId
    }).then(function(subject) {
        res.render('subjects/modify', {
            subject: subject, 
            validationErrors: validationErrors,
        });
    });
});

router.post('/modify/:id', function(req, res) {

    req.checkBody('subjectName', 'Nem adtál meg tárgynevet!').notEmpty().withMessage('Kötelező megadni!');
    req.checkBody('room', 'Nem adtál meg helyszínt!').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('description').escape();
    req.checkBody('description', 'Nem adtál meg leírást!').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    debug('validationErrors',validationErrors)
    
    if(validationErrors) {
        req.flash('validationErrors', validationErrors);
        req.flash('mod_id', req.params.id);
        res.redirect('modify');
    } else {
        req.app.models.subject.update({id: req.params.id},
            {
                subjectName: req.body.subjectName, 
                room: req.body.room,
                description: req.body.description,
                status: req.body.status
            })
        .then(function() {
            req.flash('info', 'Tantárgy sikeresen törölve!');
            //debug('res',res);
            //console.log(Object.keys(res));
            debug('output',res.output);
            debug('domain',res.domain);
            debug('connection',res.connection);
            res.redirect('list');
        })
        .catch(function (err) {
            console.log(err);
        });
    }
});

module.exports = router;