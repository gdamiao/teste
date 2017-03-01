var express = require('express');
const controller = require('../controller/controller.js');



module.exports = function(passport) {

                var router = express.Router();
                /* GET user and albuns listing. */
                router.get('/:back', function(req, res, next) {
                        res.status(200).render('signupView',{previous:req.params.back});
                });

                router.get('/', function(req, res, next) {
                        res.status(200).render('signupView');
                });

                router.post('/:back', passport.authenticate('local-signup', {
                        successRedirect : 'http://localhost:3000/login', // redirect to the secure profile section
                        failureRedirect : '/', // redirect back to the signup page if there is an error
                }));

                router.post('/', passport.authenticate('local-signup', {
                        successRedirect : 'http://localhost:3000/login', // redirect to the secure profile section
                        failureRedirect : '/', // redirect back to the signup page if there is an error
                }));

                return router;
}


