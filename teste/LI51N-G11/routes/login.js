var express = require('express');
const controller = require('../controller/controller.js');
const spotifyApp = require('../spotifyApp.js');


module.exports = function(passport) {

                var router = express.Router();

                /* GET user and albuns listing. */
                router.get('/:back', function(req, res, next) {
                        var aux = decodeURIComponent(req.params.back);
                        res.status(200).render('loginView',{previous:aux});
                });

                router.get('/', function(req, res, next) {
                        res.status(200).render('loginView');
                });


                router.post('/:back',function(req,res,next){

                        //passport.authenticate('local', { failureRedirect: '/login/'+req.params.back, successRedirect: req.params.back})
                        req.login(req.body, function(err,data){
                                if(err) {return res.redirect('/login/'+req.params.back);}
                                else {res.redirect(req.params.back);}
                        });
                });

                router.post('/',passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login' })
);

        return router;
}