var expect = require("chai").expect;
var bcrypt = require('bcryptjs');
var Waterline = require('waterline');
var waterlineConfig = require('../config/waterline');
var userCollection = require('../models/user');
var subjectCollection = require('../models/subject');
var csatCollection = require('../models/csat');

var User;

before(function (done) {
    // ORM indítása
    var orm = new Waterline();

    orm.loadCollection(Waterline.Collection.extend(userCollection));
    orm.loadCollection(Waterline.Collection.extend(subjectCollection));
    orm.loadCollection(Waterline.Collection.extend(csatCollection));
    waterlineConfig.connections.default.adapter = 'memory';

    orm.initialize(waterlineConfig, function(err, models) {
        if(err) throw err;
        User = models.collections.user;
        done();
    });
});

describe('UserModel', function () {
   
   beforeEach(function (done) {
        User.destroy({}, function (err) {
            if(err){console.log(err);}
            done();
        });
    });
    
    it('should work', function () {
        expect(true).to.be.true;
    });
    
    it('should be able to create a user', function () {
        return User.create({
                mtra: 'TANART',
                password: 'jelszo',
                surname: 'Gipsz',
                forename: 'Jakab',
                role: 'teacher',
        })
        .then(function (user) {
            expect(user.mtra).to.equal('TANART');
            expect(bcrypt.compareSync('jelszo', user.password)).to.be.true;
            expect(user.surname).to.equal('Gipsz');
            expect(user.forename).to.equal('Jakab');
            expect(user.role).to.equal('teacher');
        });
    });
    
    it('should be able to find a user', function() {
        return User.create(getUserData())
        .then(function(user) {
            return User.findOneByMtra(user.mtra);
        })
        .then(function (user) {
            expect(user.mtra).to.equal('TANART');
            expect(bcrypt.compareSync('jelszo', user.password)).to.be.true;
            expect(user.surname).to.equal('Gipsz');
            expect(user.forename).to.equal('Jakab');
            expect(user.role).to.equal('teacher');
        });
    });
    
    it('should be able to update a user', function() {
        var newName = {
            surname : 'Gipszelt',
            forename : 'József'
        };
        
        return User.create(getUserData())
        .then(function(user) {
            var id = user.id;
            return User.update(id, { surname: newName.surname, forename: newName.forename });
        })
        .then(function (userArray) {
            var user = userArray.shift();
            expect(user.mtra).to.equal('TANART');
            expect(bcrypt.compareSync('jelszo', user.password)).to.be.true;
            expect(user.surname).to.equal(newName.surname);
            expect(user.forename).to.equal(newName.forename);
            expect(user.role).to.equal('teacher');
        });
    });
    
    
    it('should throw error for invalid data: role', function () {
        var userData = getUserData();
    
        userData.role = 'rossz';
        
        expect(User.create(userData)).to.throw;
    });
    
    [
        {name: 'surname', value: ''},
        {name: 'forename', value: ''},
        {name: 'mtra', value: ''},
        {name: 'password', value: ''},
        {name: 'role', value: ''},
    ].forEach(function (attr) {
        it('should throw error for invalid data: ' + attr.name, function () {
            var userData = getUserData();
    
            userData[attr.name] = attr.value;
            
            expect(User.create(userData)).to.throw;
        });    
    });
    
    describe('#validPassword', function() {
        it('should return true with right password', function() {
             return User.create(getUserData()).then(function(user) {
                 expect(user.validPassword('jelszo')).to.be.true;
             })
        });
        it('should return false with wrong password', function() {
             return User.create(getUserData()).then(function(user) {
                 expect(user.validPassword('titkos')).to.be.false;
             })
        });
    });
    
    
});

function getUserData() {
    return {
        mtra: 'TANART',
        password: 'jelszo',
        surname: 'Gipsz',
        forename: 'Jakab',
        role: 'teacher',
    };
}