var express = require('express');
const controller = require('../controller/controller.js');
var router = express.Router();
const dbutils = require('../controller/model/DButils.js')
const handlebars = require('handlebars');
const fs = require('fs');

const profilePlaylists = handlebars.compile(fs.readFileSync('./controller/view/viewAJAX/profilePlaylists.hbs').toString());
const profileInvites = handlebars.compile(fs.readFileSync('./controller/view/viewAJAX/profileInvites.hbs').toString());

/* GET user and albuns listing. */
router.get('/', function(req, res, next) {
    if(req.user==null){
                console.log('no autorization to see profiles, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        controller.getPlayList(req.user.username, function(err, data){
            if(err) {
                console.log('error occurred in listplaylist of profile:' + err)
                res.status(500).send(err)
            }else{
                let aux = {id:req.user.username,playlists:data}
                if(!req.query.ajax){
                    controller.getUserInvitesNumber(req.user.username, function(err,data){
                        if(err) res.status(500).send(err);
                        else{
                            aux["invites"] = data;
                            res.status(200).render('profile',aux)
                        }
                    })
                    
                }else{
                        res.send(profilePlaylists(aux))

                }
            }
        })
    }
});
router.get('/accept/invitation/:invite', function(req,res,next){
        if(req.user==null){
                    console.log('no autorization to see profiles, please log in first to see yours')
                    res.status(401).send('No Authorization')
        }
        else{ 
            controller.acceptSharingInvitation(req.user.username,req.params.invite, function(err, data){
                if(err) {
                            console.log('error occurred in remove invitation in controller: ' + err)
                            res.status(500).send(err);
                }else{
                        res.status(200).send("ok");
                    }
                })
        }

})

router.get('/remove/invitation/:invite',function(req,res,next){
        if(req.user==null){
                    console.log('no autorization to see profiles, please log in first to see yours')
                    res.status(401).send('No Authorization')
        }
        else{ 
            controller.deleteSharingInvitation(req.user.username,req.params.invite, function(err, data){
                if(err) {
                            console.log('error occurred in remove invitation in controller: ' + err)
                            res.status(500).send(err);
                }else{
                        res.status(200).send("ok");
                    }
                })
        }

});
router.get('/getsharedsong', function(req,res,next){
        if(req.user==null){
                    console.log('no autorization to see profiles, please log in first to see yours')
                    res.status(401).send('No Authorization')
        }
        else{ 
            let aux = req.query.share;
            let username = aux.substring(0, aux.indexOf(':'))
            let playlist = aux.substring(aux.indexOf(':')+1,aux.length);
            controller.getSharedSongsDiv(username,playlist, function(err, data){
                if(err) {
                            console.log('error occurred in getsongs div of controller: ' + err)
                            res.status(500).send(err);
                }else{
                        res.status(200).send(data);
                    }
                })
        }
})

router.get('/getInvites', function(req, res, next){
        if(req.user==null){
                    console.log('no autorization to see profiles, please log in first to see yours')
                    res.status(401).send('No Authorization')
        }
        else{ 
            controller.getUserInvitesObjects(req.user.username, function(err, data){
                if(err) {
                            console.log('error occurred in get user invites of controller: ' + err)
                            res.status(500).send(err);
                }else{
                        res.status(200).send(profileInvites({invites:data}));
                    }
                })
        }
})


router.get('/:playlistname', function(req, res, next) {
    if(req.user==null){
                console.log('no autorization to see profiles, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        controller.getSongsDiv(req.user.username,req.params.playlistname, function(err, data){
        if(err) {
                    console.log('error occurred in getsondsdiv of playlist: ' + err)
                    res.status(500).send(err);
        }else{
                    res.status(200).send(data);
            }
        })
    }
});

router.get('/create/:playlistname', function(req, res, next){
    if(req.user==null){
                console.log('no autorization to see profiles, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        controller.createPlaylist(req.user.username, req.params.playlistname, function(error, data){
            if(error) {
                        console.log('error occurred in createplaylist in createplaylist route: ' + error)
                        res.status(500).send(error);
            }else{
                controller.playlistsRefresh(req.user.username,  function(err, body){
                        if(err) {
                                    console.log('error occurred in playlistrefresh of create playlist: ' + err)
                                    res.status(500).send(err);
                        }else{
                                    res.status(200).send(body);
                            }
                    });
                }
        });
    }

});

router.get('/delete/:playlistname', function(req, res, next){
    if(req.user==null){
                console.log('no autorization to see profiles, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        controller.deletePlaylist(req.user.username, req.params.playlistname, function(error, data){
            if(error) {
                        console.log('error occurred in deleteplaylist of deleteplaylist route:' + error)
                        res.status(500).send(error);
            }else{
                controller.playlistsRefresh(req.user.username,  function(err, body){
                        if(err) {
                                    console.log('error occurred in playlistrefresh of delete playlist:' + err)
                                    res.status(500).send(err);
                        }else{
                                    res.status(200).send(body);
                            }
                    });
                }
        });
    }

});

router.get('/rename/:oldname/:newname', function(req, res, next){
    if(req.user==null){
                console.log('no autorization to see profiles or do any profile operation, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        controller.renamePlaylist(req.user.username, req.params.oldname, req.params.newname, function(error, data){
            if(error) {
                        console.log('error occurred in renameplaylist of renamePlaylist route:' + error)
                        res.status(500).send(error);
            }else{
                controller.playlistsRefresh(req.user.username,  function(err, body){
                        if(err) {
                                    console.log('error occurred in playlistrefresh of rename playlist:' + err)
                                    res.status(500).send(err);
                        }else{
                                    res.status(200).send(body);
                            }
                    });
                }
        });
    }

});

router.post('/deletesongs/', function(req, res, next){
    if(req.user==null){
                console.log('no autorization to see profiles or do any profile operation, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 

        controller.deleteSongs(req.user.username, req.body.playlist, req.body.songs, function(error, data){
            if(error) {
                        console.log('error occurred in deletesongs of deleteSongs: ' + error)
                        res.status(500).send(error);
            }else{
                controller.getSongsDiv(req.user.username, req.body.playlist,  function(err, body){
                        if(err) {
                                    console.log('error occurred in getsongsDiv of deleteSongs: ' + err)
                                    res.status(500).send(err);
                        }else{
                                    res.status(200).send(body);
                            }
                    });
                }
        });
    }

});


router.get('/share/:shareuser/:shareplaylist', function(req, res, next){
    if(req.user==null){
                console.log('no autorization to see profiles or do any profile operation, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        if(req.user.username==req.params.shareuser){
            res.status(500).send("you cannot share a playlist with yourself!")
        }else{
            controller.sendShareInvite(req.user.username, req.params.shareuser, req.params.shareplaylist, req.query.permission, function(error, data){
                if(error) {
                            console.log('error occurred in deletesongs of deleteSongs: ' + error)
                            res.status(500).send(error);
                }else{
                        res.status(200).send("created")
                    
                }
            });
        }

    }

});


router.get('/unshare/:shareuser/:shareplaylist', function(req, res, next){
    if(req.user==null){
                console.log('no autorization to see profiles or do any profile operation, please log in first to see yours')
                res.status(401).send('No Authorization')
    }
    else{ 
        if(req.user.username==req.params.shareuser){
            res.status(500).send("you cannot share a playlist with yourself!")
        }else{
            controller.unshareUser(req.user.username, req.params.shareuser, req.params.shareplaylist, function(error, data){
                if(error) {
                            console.log('error occurred in deletesongs of deleteSongs: ' + error)
                            res.status(500).send(error);
                }else{
                        res.status(200).send("unshared!")
                    
                }
            });
        }
    }

});






module.exports = router;