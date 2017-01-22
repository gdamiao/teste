var express = require('express');
const controller = require('../controller/controller.js');
const spotifyApp = require('../spotifyApp.js');

var router = express.Router();

router.get('/:back', function(req, res, next) {
                        req.session.destroy(function (err) {
                            res.redirect(req.params.back); //Inside a callback… bulletproof!
                        })
                });

router.get('/', function(req, res, next) {
        req.session.destroy(function (err) {
            res.redirect('/'); //Inside a callback… bulletproof!
        })
});


module.exports = router;