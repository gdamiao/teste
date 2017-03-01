'use strict'

const nano = require('nano')('http://localhost:5984');

const SHAREDDB = "g11shared";
const USERSDB = "g11users"
var exportsHandler = {};

/*
dbcreate //inserir user
getdb //get user
getalldbs // get users 
*/


exportsHandler.createUser = function(username,nome,email,password, callback){
    
        nano.use(USERSDB).insert({_id:username, 
                                    nome:nome, 
                                    email:email, 
                                    password:password,
                                    playlists:[],
                                    invites:[]}, function(erro,body) {
            if (!erro) {
                console.log('database '+username+' created!');
                callback(null,username);
            }else callback(erro,null)
        })
}

exportsHandler.listPlaylists= function(username, callback){
    //ONLY LISTS READ-WRITE PLAYLISTS and normal ones
    var users = nano.use(USERSDB);
    var playlists = [];
    user.get(username, function(error, data){
        if (!err) {
            data.playlists.forEach(item, (playlist)=>{
                if(playlist.type==="shared"){
                    if(playlist.permissions==="read-write"){
                        playlists.push(playlist);
                    }
                }else{
                    playlists.push(playlist);
                }
            })
            callback(null, playlists)
        }
        else {callback(err,null);}

    })
}
//
exportsHandler.listReadPlaylists= function(username, callback){
    //ONLY LISTS READ PLAYLISTS
    var users = nano.use(USERSDB);
    var playlists = [];
    user.get(username, function(error, data){
        if (!err) {
            data.playlists.forEach(item, (playlist)=>{
                if(playlist.type==="shared"){
                    if(playlist.permissions==="read"){
                        playlists.push(playlist);
                    }
                }else{
                    playlists.push(playlist);
                }
            })
            callback(null, playlists)
        }
        else {callback(err,null);}

    })
    
}


exportsHandler.listPlaylistSongs= function(username,playlist, callback){
    if(playlist.indexOf(':')!=-1){
        nano.use(SHAREDDB).get(playlist, function(err,body){
            if (!err) {
                callback(null,body.songs);
            }
            else callback(err,null);
        })
    }
    else{
        nano.use(USERSDB).get(username,function(err, body) {
            if (!err) {
                var teste = body.playlists[playlist].songs;
                callback(null,body.playlists[playlist].songs)
            }
            else callback(err,null);
        });
    }
}

exportsHandler.deleteSharingInvitation = function(username, invite, callback){
    var userdb = nano.use(USERSDB)
    userdb.get(username, function(err, data) {
            if (err) {return callback(err,null)}
            else{

                let aux = data;
                delete aux.invites[invite];
                userdb.insert(aux,data._rev,function(error,resp){
                    if(error){
                        Console.log("error in DB utils deleteSharingInvitation");
                        return callback(error,null)
                    }else{
                        return callback(null,resp)
                    }
                })
            }
     });

}

exportsHandler.getSharedPlaylistSongs = function(playlistname, cb){
    nano.use(SHAREDDB).get(playlistname, function(err,data){
        if(err) cb(err,null);
        else{
            cb(null,data.songs)
        }
    })
}

exportsHandler.sharedPlayListCreation = function(username, invitation, cb){
     var sharedbd = nano.use(SHAREDDB);
     var usershare = invitation.substring(0,invitation.indexOf(":"))
     var playlist = invitation.substring(invitation.indexOf(":")+1,invitation.length);
     sharedbd.list(function(err,data){
        if(err){
            console.log("sharedPlayListCreation in dbutils error")
            cb(err,data);
        }
        else{
            var found = false;
            data.rows.forEach((item)=>{
                if(item.id==invitation){
                    found=true;
                }
            })
            if(!found){
                nano.use(USERSDB).get(usershare, function(error,response){
                    if(error){
                        console.log("error in dbutils sharedPlayListCreation in getting playlist from sharing user")
                        cb(error,null)
                    }
                    else{
                        sharedbd.insert({_id:invitation, songs:response.playlists[playlist].songs}, function(e, ret){
                            if(e){
                                console.log("error in dbutils sharedPlayListCreation in inserting shared playlist")
                                cb(e,null);
                            }else cb(null,data)
                        })
                    }
                })
            }else{
                cb(null,data);
            }
        }
     })
}

exportsHandler.createSharedPlaylistReference = function(username, invitation, callback){
    var userdb = nano.use(USERSDB);
    userdb.get(username, function(err, data) {
        if (err) {return callback(err,null)}
        else{
            let aux = data;
            aux.playlists.push({id:invitation, permissions:data.invites[invitation], type:"shared"});
            userdb.insert(aux,data._rev,function(error, body) {
                if (error){
                    console.log("error in dbutils createSharedPlaylistReference in user insert shared playlist")
                    callback(error,null);
                }else{
                    exportsHandler.deleteSharingInvitation(username, invitation, function(e, resp){
                        if(e) {
                            console.log("error in deleteSharingInvitation in createSharedPlaylistReference at dbutils")
                            callback(e,null);
                        }else{
                            callback(null,"ok")
                        }
                    })
                }
            });
        }
    })
}


function getUserInfo(name,callback){
    
        nano.use(USERSDB).get(name, function(error, body) { 
            if (error) {
                return callback(error,null)
            }else{
                var user={};
                user.username=name;
                user.password=body.password;
                return callback(null,user);
                    
            }

        });
}

exportsHandler.authenticate = function (username, passwd, cb) {
    getUserInfo(username, function(err, data){
        if(!data) return cb(new Error('User does not exists'))
        if(passwd != data.password) return cb(new Error('Invalid password'))
        cb(null, data)
    })
}


exportsHandler.find = function(username, cb) {
    const user = getUserInfo(username,cb);
}

exportsHandler.deletePlaylist = function(username,playlistid,  cb) {
    var usersdb = nano.use(USERSDB);
    var rev = '';
    exportsHandler.checkIfPlaylistExists(username, playlistid, function(error,resp){
        if(error)cb(error,null);
        else{
            if(resp){
                usersdb.get(username, function(err, data) {
                        if (err) {return cb(err,null)}
                        else{
                            let playlistsfinal = []
                            data.playlists.forEach((item)=>{
                                if(!(item.id===playlistid)){
                                    playlistsfinal.push(item);
                                }
                            })
                            let aux = data;
                            aux.playlists = playlistsfinal;
                            // rev sai?
                            rev=data._rev;
                            usersdb.insert(aux,rev,function(err, body) {
                                    if (!err){
                                        cb(null,body);
                                    }else{
                                        console.log("error on deleteplaylist of dbutils")
                                        cb(err,null);
                                    }
                            });         
                        }
                });
            }else{
                cb("the playlist you are trying to delete doenst exist!",null)
            }
        }
    })
}


exportsHandler.checkIfPlaylistExists = function(user, playlist, callback){
        nano.use(USERSDB).get(user, function(error,data){
            var found=false;
            data.playlists.forEach((item)=>{
                if(item.id==playlist){
                    found=true;
                    callback(error,true)
                }
            })
            if(!found){
                callback(error,false)
            }
        })

}
exportsHandler.createPlaylist = function(username,playlistname,  cb) {
    var userdb = nano.use(USERSDB);
    var rev = '';
    usersdb.get(username, function(error, data){
        if(error) cb(error, null);
        else{
            let aux = data;
            aux.playlists.push({id:playlistname, songs:[], type:"normal"})
            userdb.insert(aux,data._rev,function(err, body) {
                if (!err)
                    cb(null,body);
                else{
                    cb(err,body);
                }
            });
        }


    })
}

exportsHandler.renamePlaylist = function(username,oldname,newname,  cb) {
     var userdb = nano.use(USERSDB);
     exportsHandler.checkIfPlaylistExists(username, oldname, function(error,resp){
        if(error)cb(error,null);
        else{
            if(resp){
                userdb.get(username, function(err,data){
                    if(err) cb(err,null);
                    else{
                        let aux = data;
                        for(let i =0; i<aux.playlists.length; i++){
                            if(aux.playlists[i].id=== oldname){
                                aux.playlists[i].id=newname;
                                break;
                            }
                        }
                         //verify if deleted sucessfuly and inserted new
                        userdb.insert(aux, data._rev, function(error,body){
                            if(error) cb(err,null);
                            else{
                                console.log("sucessfully renamed")
                                cb(null,body)
                            }
                        })
                    }

                })
            }else{
                cb("the playlist you are trying to rename doenst exist!",null)
            }
        }

     })
}

exportsHandler.deleteSongs = function(username,playlistid,songs, cb) {
     var usersdb = nano.use(USERSDB);
     var rev = '';
     if(playlistid.indexOf(":")!=-1){
         usersdb.get(username, function(fail, success){
             if(fail)cb(fail,null);
             else{
                var playlist = {};
                success.playlists.forEach((item)=>{
                    if(item.id===playlistid){
                        playlist=item;
                    }
                })
                if(playlist.permissions==="read-write"){
                    nano.use(SHAREDDB).get(playlistid, function(err, data) {
                        if (err) {return cb(err,null)}
                        else{
                            var oldsongs =data.songs;
                            rev=data._rev;
                            var newsongs = [];
                            var originaluser = playlistid.substring(0,playlistid.indexOf(":"))
                            for(var i=0, j=0; i<oldsongs.length; i++){
                                if(i==songs[j]){
                                    j++;
                                }else{
                                    newsongs.push(oldsongs[i]);
                                }
                            }
                            nano.use(SHAREDDB).insert({_id:playlistid,_rev:rev, songs:newsongs},function(e, body) {
                                if (!e){
                                    nano.use(USERSDB).get(username, function(error, response){
                                        if(eror) cb(error,null);
                                        else{
                                            let aux = response;
                                            aux.forEach((item)=>{
                                                if(item.id===playlistid){
                                                    playlist.songs=newsongs;
                                                }
                                            })//verify aux new songs
                                            nano.use(USERSDB).insert(aux,response._rev, function(er, re){
                                                if(er) cb(er,null)
                                                else cb(null, re);
                                            })
                                        }
                                    })
                                }
                                else{
                                    cb(e,null)
                                }
                            })
                        }
                    });
                }else{
                    cb("you don't have the permissions to alter this playlist!",null)
                }
             }
         })
         
     }else{
        usersdb.get(username, function(err, data) {
            if (err) {return cb(err,null)}
            else{
                let aux = data;
                let playlist = {};
                data.playlists.forEach((item)=>{
                    if(item.id===playlistid){
                        playlist=item;
                    }
                })//verify aux new songs
                var oldsongs =playlist.songs;
                var newsongs = [];
                for(var i=0, j=0; i<oldsongs.length; i++){
                    if(i==songs[j]){
                        j++;
                    }else{
                        newsongs.push(oldsongs[i]);
                    }
                }
                for(let i =0; i<aux.playlists.length; i++){
                    if(aux.playlists[i].id=== playlistid){
                        aux.playlists[i].songs=newsongs;
                        break;
                    }
                }
                usersdb.insert(aux, data._rev,function(err, body) {
                        if (!err){
                            cb(null,body);
                        }
                        else{
                            cb(err, null);
                        }
                        });
                }
        });
     }    
}


exportsHandler.addTracks = function(tracks, playlist, username,  callback) {
    var usersdb = nano.use(USERSDB);
    if(playlist.indexOf(":")!=-1){
        usersdb.get(username, function(fail, success){
            var playlist = {};
            success.playlists.forEach((item)=>{
                if(item.id===playlistid){
                    playlist=item;
                }
            })
            if(playlist.permissions==="read-write"){
                addTracksToSharedDB(tracks, playlist, username,  callback);
            }else{
                callback("you dont have permissions to alter the playlist!",null);
            }
        })    
    }else{
        nano.use(SHAREDDB).list(function(e,body){
            var found=false;
            body.rows.forEach((item)=>{
                if(item.id===username+":"+playlist){
                    found=true;
                }
            })
            if(!found){
                addTracksToOriginalUser(tracks, playlist, username,  callback);
            }else{
                addTracksToSharedDB(tracks, username+":"+playlist, username,  callback);
            }
        })
    }

}

function addTracksToSharedDB(tracks, playlist, username, callback){
    var rev='';
    var tracksArray = [];
    nano.use(SHAREDDB).get(playlist, function(e,body){
        if (e) {return callback(e,null)}
        else{
            rev=body._rev;
            tracksArray = body.songs;
            if(!(tracks instanceof Array)){
                tracksArray.push(tracks);
                nano.use(SHAREDDB).insert({_id:playlist, _rev:rev,songs:tracksArray},function(error,data){
                    if(error)callback(error,null);
                    else {
                        username = playlist.substring(0,playlist.indexOf(":"));
                        playlist = playlist.substring(playlist.indexOf(":")+1, playlist.length);
                        addTracksToOriginalUser(tracks, playlist, username,  callback);
                    }
                })
            } else{
                var result = tracksArray.concat(tracks);
                nano.use(SHAREDDB).insert({_id:playlist, _rev:rev, songs:result},function(error,data){
                    if(error)
                    {
                        callback(error,null);
                    }
                    else {
                        username = playlist.substring(0,playlist.indexOf(":"));
                        playlist = playlist.substring(playlist.indexOf(":")+1, playlist.length);
                        addTracksToOriginalUser(tracks, playlist, username,  callback);
                    }
                });
            }
        }
    })
}

function addTracksToOriginalUser(tracks, playlist, username,  callback){
    var rev='';
    nano.use(USERSDB).get(username, function(err, data) {
        if (err) {return callback(err,null)}
        else{
            var aux = data
            rev=data._rev;
            if(!(tracks instanceof Array)){
                aux.playlists.forEach((item)=>{
                    if(item.id===playlistid){
                        item.songs.push(tracks);
                    }
                })
                nano.use(USERSDB).insert(aux, rev,function(error,body){
                    if(error)callback(error,null);
                    else {
                        callback(null,body);
                    }
                })
            } else{
                aux.playlists.forEach((item)=>{
                    if(item.id===playlistid){
                        item.songs.concat(tracks);
                    }
                })
                nano.use(username).insert(aux, rev,function(error,body){
                    if(error)callback(error,null);
                    else {
                        callback(null,body)
                    }
                });
            }
        }
    });
}

exportsHandler.checkIfUserExists = function(username, callback){
    nano.use(USERSDB).list(function(error, data){
        if(error)callback(error,null);
        else{
            var found=false;
            data.forEach((item)=>{
                if(item===username){
                    found=true;
                    callback(null,true)
                } 
            })
            if(!found){
                callback(null,false)
            }
        }
    })
}

//not done, invites struct: {id:teste:teste, permissions:read-write}
exportsHandler.createShareInvite = function(username, shareuser, shareplaylist, permission, callback){
     var user = nano.use(shareuser);
     var playlist =shareplaylist;
     var perm = permission;
     nano.use(username).list(function(er, res){
         if(er) callback(er, null)
         else{
            var exists = false;
            res.rows.forEach((item)=>{
                if(item.id===(shareplaylist)){
                    exists=true;
                }
            })
            if(exists){
                exportsHandler.checkIfUserExists(shareuser, function(erro, existsShareUser){
                    if(!existsShareUser){
                        callback("the user you are trying to share with doenst exist!", null);
                    }
                    else{
                        exportsHandler.getUserInvitesObjects(shareuser, function(e,body){
                            if(e) callback(e,null);
                            else{
                                var found = false;
                                body.forEach((item)=>{
                                    if(item.id===(username+":"+shareplaylist)){
                                        found=true;
                                    }
                                })
                                if(found){
                                    callback("invite already sent!",null)
                                }
                                else{
                                    user.list(function(err,data){
                                        if(err) callback(err,data);
                                        else{
                                            var found = false;
                                            data.rows.forEach((item)=>{
                                                if(item.id===(username+":"+shareplaylist)){
                                                    found=true;
                                                }
                                            })
                                            if(found){
                                                callback("playlist already sharing!",null)
                                            }else{
                                                user.get('invites', function(er, respo) {
                                                    if (er) {return callback(er,null)}
                                                    else{
                                                        var aux= respo;
                                                        aux[username+":"+playlist]=perm;
                                                        user.insert(aux,function(error,resp){
                                                            if(error){
                                                                Console.log("error in DB utils createShareInvite");
                                                                return callback(error,null)
                                                            }else{
                                                                return callback(null,resp)
                                                            }
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                    })
                                }
                                
                            }
                        })
                    }

                })
            }else{
                callback("you dont have a playlist with the playlist name you tried to share!",null)
            }
         }

     })
}

exportsHandler.getUserInvites = function(username, cb){
         nano.use(USERSDB).get(usermame,function(err,data){
             if(err) cb(err,null);
             else{
                 cb(null,data.invites);
             }
         })
}

//not done
exportsHandler.unshareUser = function(username, shareuser, playlist, callback){
         nano.use(username).list(function(er, res){
            if(er) callback(er, null)
            else{
                var exists = false;
                res.rows.forEach((item)=>{
                    if(item.id===playlist){
                        exists=true;
                    }
                })
                if(exists){
                    exportsHandler.checkIfUserExists(shareuser, function(erro, existsShareUser){
                        if(!existsShareUser){
                            callback("the user you are trying to unshare with doenst exist!", null);
                        }
                        else{
                            exportsHandler.getUserInvitesObjects(shareuser, function(err, data){
                                if(err) callback(err,null);
                                else{
                                    var found = false;
                                    data.forEach((item)=>{
                                        if(item.id===(username+":"+playlist)){
                                            found=true;
                                            exportsHandler.deleteSharingInvitation(shareuser, username+":"+playlist, function(error,body){
                                                if(error) callback(error,null);
                                                else{
                                                    callback(null,body)
                                                }
                                            })
                                        }
                                    })
                                    if(!found){
                                        nano.use(shareuser).list(function(error,body){
                                            if(error) callback(error,null);
                                            else{
                                                body.rows.forEach((item)=>{
                                                    if(item.id===(username+":"+playlist)){
                                                        found=true;
                                                        exportsHandler.deletePlaylist(shareuser, username+":"+playlist, function(e, resp){
                                                            if(e) return callback(e,null);
                                                            else{
                                                                return callback(null,resp)
                                                            }
                                                        })
                                                    }
                                                })
                                                if(!found){       
                                                    callback("playlist inst beeing shared nor an invite has been sent!",null)
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }else{
                    callback("you dont have a playlist with the playlist name you tried to unshare!",null)
                }
            }
         })
}

exportsHandler.getUserInvitesNumber = function(username, cb){
    exportsHandler.getUserInvites(username, function(err, data){
        if(err){
            console.log("error in dbutils getuserinvites number");
            cb(err, null)
        }
        else{
            cb(null,Object.keys(data).length)
        }
    });
}

exportsHandler.getUserInvitesObjects = function(username, cb){
    exportsHandler.getUserInvites(username, function(err, data){
        if(err){
            console.log("error in dbutils in get user invites objects")
            cb(err, null);
        }
        else{
            var invites=[];
            var found=false;
            var itemsprocessed=data.length;
            data.forEach((invite)=>{
                invites.push({
                    username:invite.id.substring(0,invite.id.indexOf(":")),
                    playlist:invite.id.substring(invite.id.indexOf(":")+1,invite.id.length),
                    permissions:invite.permissions,
                    id:invite.id
                });
                itemsprocessed--;
                if(itemsprocessed==0){
                    found =true;
                    cb(null, invites);
                }     
                
            })
            if(!found) cb(null, invites);
        }
    })

}



module.exports= exportsHandler;