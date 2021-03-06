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
                                if(err) {return res.status(500).send('/login/'+req.params.back);}
                                else {res.status(200).send(req.params.back);}
                        });
                });

                router.post('/',function(req,res,next){
                         req.login(req.body, function(err,data){
                                if(err) {return res.status(500).send('/login/');}
                                else {res.status(200).send('/');}
                        });
                });

        return router;
}