var express = require('express');
const controller = require('../controller/controller.js');
var router = express.Router();
const dbutils = require('../controller/model/DButils.js')

/* GET user and albuns listing. */
router.get('/addingTracks/:album', function(req, res, next) {
    var username= null;
    if(req.user==null) {
        console.log('no autorization to add musics, please log in first')
        res.status(401).send('No Authorization, please log in first.')
    }
    else{
        controller.addToPlayList(req.params.album,req.user.username, function(error, data){
            if(error) return next(err);
            else{
                res.status(200).send(data);
            }
        });
    }
});

router.get('/insert', function(req, res, next) {
    if(req.user==null) {
        console.log('no autorization to add musics, please log in first')
        res.status(401).send('No Authorization, please log in first.')
    }
    else{
        var tracks = req.query.trackid;
        var previous = req.query.current;
        var playlist = req.query.playid;
        dbutils.addTracks(tracks, playlist, req.user.username, function(err, data){
            if(err) {
                res.writeHead(500)
                res.send("error occured while adding tracks:" + err);
            }
            else{
                console.log(data);
                res.redirect(previous);

            }
        });
        
    }
});

    router.get('/delete/:playlist',function(req, res, next){
        dbutils.deletePlaylist(req.user.username, req.params.playlist, function(err,data){
            if(err) {
                res.writeHead(500)
                res.send("error occured while adding tracks:" + err);
            }
            else{
                console.log(data);
                res.redirect('/profile');
            }
    });
    });

    router.get('/insert/:playlistname',function(req, res, next){
        dbutils.createPlaylist(req.user.username, req.params.playlistname, function(err, data){
            if(err) {
                res.writeHead(500)
                res.send("error occured while adding tracks:" + err);
            }
            else{
                console.log(data);
                res.redirect('/profile');
            }
        });
    });
module.exports = router;