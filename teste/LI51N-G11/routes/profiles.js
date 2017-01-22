var express = require('express');
const controller = require('../controller/controller.js');
var router = express.Router();
const dbutils = require('../controller/model/DButils.js')


/* GET user and albuns listing. */
router.get('/', function(req, res, next) {
    if(req.user==null){
                console.log('no autorization to see profiles, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        dbutils.listPlaylists(req.user.username, function(err, data){
        if(err) {
                    console.log('error occurred:' + err)
                    res.status(500).send(err)
        }else{
                    var aux = {id:req.user.username,playlists:data}
                    res.status(200).render('profile',aux)
            }
        })
    }
});

router.get('/:playlistname', function(req, res, next) {
    if(req.user==null){
                console.log('no autorization to see profiles, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        controller.getSongsDiv(req.user.username,req.params.playlistname, function(err, data){
        if(err) {
                    console.log('error occurred:' + err)
                    res.status(500).send(err);
        }else{
                    res.status(200).send(data);
            }
        })
    }
});

module.exports = router;