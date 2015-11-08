// controllers/subject.js
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var util = require('util');
function debug(title, data){
    console.log(title + ": " + util.inspect(data, false, null));
}

var statusTexts = {
    true : 'Jelentkezhet',
    false : 'Nem jelentkezhet',
};

var teacherStatusTexts = {
    true : 'Aktív',
    false : 'Passzív',
};

var statusClasses = {
    true : 'success',
    false : 'danger',
};

function decorateSubjects(subjectContainer, teacher) {
    return subjectContainer.map(function (e) {
        e.statusText = (teacher) ? teacherStatusTexts[e.status] : statusTexts[e.status];
        e.statusClass = statusClasses[e.status];
        return e;
    });
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

function getUserById(req, id, done){
    req.app.models.user.findOne({ id: id }, function(err, user) {
        if (err) { return done(err); }
        return done(null, user);
    });
}

router.get('/list', function (req, res) {
    var teacher = (req.user.role == "teacher");
    if(teacher){
        req.app.models.subject.find()
        .then(function (subjects) {
            var count = subjects.length;
            function _for(i){
            	if(i == count){
            		res.render('subjects/list_teacher', {
            			errors: decorateSubjects(subjects, teacher),
            			messages: req.flash('info'),
            			user : req.user
            		});
            	}else{
                	var s = subjects[i];
                	getUserById(req, s.user, function(err, user){
                		if(err){console.log(err)};
                		_.extend(s, {creator : user.surname + ' ' + user.forename});
                		i++;
                		_for(i, subjects);
                	});
            	}
            }
            _for(0);
        })
        .catch(function (err) {
            console.log(err);
        });
    } else {
        req.app.models.csat.find({student_id : req.user.id})
        .then(function (felvett){
            var subjects_ids = [];
            for(var i in felvett){
                subjects_ids.push(felvett[i].subject_id);
            }
            req.app.models.subject.find()
            .then(function(subjects) {
                var count = subjects.length;
                function _for(i){
                	if(i == count){
                		res.render('subjects/list', {
                			errors: decorateSubjects(subjects, teacher),
                			messages: req.flash('info'),
                			user : req.user
                		});
                	}else{
                    	var s = subjects[i];
                    	if(_.indexOf(subjects_ids, s.id) != -1){
                            _.extend(s, {picked : true});
                        }
                    	getUserById(req, s.user, function(err, user){
                    		if(err){console.log(err)};
                    		_.extend(s, {creator : user.surname + ' ' + user.forename});
                    		i++;
                    		_for(i, subjects);
                    	});
                	}
                }
                _for(0);
            })
            .catch(function (err) {
                console.log(err);
            });
        })
        .catch(function (err) {
            console.log(err);
        });
    }
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
            description: req.body.description,
            user : req.user
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
        res.redirect('/subjects/list');
    })
    .catch(function (err) {
        console.log(err);
    });
});

router.get('/add/:id', ensureAuthenticated, function(req, res) {
    req.app.models.csat.create({
        student_id : req.user.id,
        subject_id : req.params.id
    })
    .then(function(csat) {
        req.flash('info', 'Tantárgy sikeresen felvéve!');
        res.redirect('/subjects/list');
    })
    .catch(function (err) {
        console.log(err);
    });
});

router.get('/remove/:id', ensureAuthenticated, function(req, res) {
    req.app.models.csat.destroy({
        subject_id: req.params.id
    })
    .then(function(csat) {
        req.flash('info', 'Tantárgy sikeresen leadva!');
        res.redirect('/subjects/list');
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
    })
    .catch(function (err) {
        console.log(err);
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
                status: req.body.status,
                user : req.user
            })
        .then(function() {
            req.flash('info', 'Tantárgy sikeresen módosítva!');
            res.redirect('/subjects/list');
        })
        .catch(function (err) {
            console.log(err);
        });
    }
});

module.exports = router;