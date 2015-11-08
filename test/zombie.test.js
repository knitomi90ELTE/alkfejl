var Browser = require('zombie');

Browser.localhost(process.env.IP, process.env.PORT);

describe('User visits index page', function() {
    var browser = new Browser();
    
    before(function() {
        return browser.visit('/');
    });
    
    it('should be successful', function() {
        browser.assert.success();
    });
    
    it('should see welcome page', function() {
        browser.assert.text('div.page-header > h1', 'Bejelentkezés');
    });
});
describe('User visits new subject page', function (argument) {
        
    var browser = new Browser();
        
    before(function() {
        return browser.visit('/subjects/new');
    });
        
    it('should go to the authentication page', function () {
        browser.assert.redirected();
        browser.assert.success();
        browser.assert.url({ pathname: '/login' });
    });
        
    it('should be able to login with correct credentials', function (done) {
        browser
            .fill('mtra', 'TANART')
            .fill('password', 'jelszo')
            .pressButton('button[type=submit]')
            .then(function () {
                browser.assert.redirected();
                browser.assert.success();
                browser.assert.url({ pathname: '/subjects/list' });
                done();
        });
    });
        
    it('should go the subjects page', function () {
        return browser.visit('/subjects/new')
        .then(function () {
            browser.assert.success();
            browser.assert.text('div.page-header > h1', 'Tárgy létrehozása');
        });
    });
    
    it('should show errors if the form fields are not right', function () {
        return browser
            .fill('subjectName', '')
            .fill('description', '')
            .fill('room', '')
            .pressButton('button[type=submit]')
            .then(function() {
                // browser.assert.redirected();
                browser.assert.success();
                browser.assert.element('form .form-group:nth-child(1) [name=subjectName]');
                browser.assert.hasClass('form .form-group:nth-child(1)', 'has-error');
                browser.assert.element('form .form-group:nth-child(2) [name=description]');
                browser.assert.hasClass('form .form-group:nth-child(2)', 'has-error');
                browser.assert.element('form .form-group:nth-child(3) [name=room]');
                browser.assert.hasClass('form .form-group:nth-child(3)', 'has-error');
            });
    });
    
    it('should show submit the right-filled form fields and go back to list page', function() {
        browser
            .fill('subjectName', 'Teszt tárgy')
            .fill('description', 'Teszt tárgy leírás')
            .fill('room', 'Teszt tárgy terem')
            .pressButton('button[type=submit]')
            .then(function() {
                browser.assert.redirected();
                browser.assert.success();
                browser.assert.url({ pathname: '/subjects/list' });
                
                browser.assert.element('table.table');
                browser.assert.text('table.table tbody tr:last-child td:nth-child(2)', 'Teszt tárgy');    
                browser.assert.text('table.table tbody tr:last-child td:nth-child(3)', 'Teszt tárgy terem');    
                browser.assert.text('table.table tbody tr:last-child td:nth-child(4)', 'Teszt tárgy leírás');
            });
    });
});