'use strict'

const nano = require('nano')('http://localhost:5984');
const sharedplaylistsDBstring = "sharedplaylists";
var exportsHandler = {};

/*
dbcreate //inserir user
getdb //get user
getalldbs // get users 
*/

exportsHandler.createSharedPlaylistsBD = function(callback){
    
    nano.db.list(function(err, body) {
        if (!err) {
            var bds = body;
            if(bds.length===2){
                nano.db.create(sharedplaylistsDBstring, function(erro,body) {
                    if (!erro) {
                        callback(null,"sharedplaylists bd created")
                    }else callback(erro,null)
                })
            }else{
                callback(null,"sharedplaylists bd exists");
            }
        }
        else{callback(err,null);}
    });
}

exportsHandler.createUser = function(username,nome,email,password, callback){
    
        nano.db.create(username, function(erro,body) {
            if (!erro) {
                console.log('database '+username+' created!');
                nano.use(username).insert( {_id:'info',
                                            nome:nome,
                                            email:email,
                                            password:password}, 
                    function(err, data) {
                        var sign = {username: username, password:password}
                        if (!err){
                            console.log(data);
                            return callback(null,sign, data);
                        }
                        else callback(err, null)
                    });
            }else callback(erro,null)
        })
}

exportsHandler.listPlaylists= function(username, callback){
    var user = nano.use(username);
    var playlists = [];
    var itemsProcessed = 0;
    user.list(function(err, body) {
        if (!err) {
            body.rows.forEach(function(doc) {
                user.get(doc.id, function(err, bodydoc) {
                        itemsProcessed++;
                        if (!err){
                            if(bodydoc.type==="playlist"){
                                playlists.push(bodydoc);
                            }
                            if(itemsProcessed === body.rows.length) {
                                callback(null,playlists);
                            }
                        }
                        else callback(err,null);
                        });
            });
        }
        else {callback(err,null);}
    });
}


exportsHandler.listPlaylistSongs= function(username,playlist, callback){
    var user = nano.use(username);
    user.get(playlist,function(err, body) {
        if (!err) {
            callback(null,body.songs);
        }
        else callback(err,null);
    });
}

function getUserInfo(name,callback){
    
        nano.db.get(name, function(error, body) { 
            if (error) {
                return callback(error,null)
            }else{
                var user={};
                var userDB = nano.use(name);
                userDB.get('info', function(err, data) {
                    if (err) {return callback(err,null)}
                    else{
                        user.username=name;
                        user.password=data.password;
                        return callback(null,user);
                    }
                });
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
     var user = nano.user(username);
     var rev = '';
     user.get(playlist, function(err, data) {
                    if (err) {return callback(err,null)}
                    else{
                        rev=data._rev;
                        user.destroy(playlistid,rev,function(err, body) {
                                if (!err)
                                    cb(null,body);
                                });
                    }
     });
}

exportsHandler.createPlaylist = function(username,playlistname,  cb) {
     var user = nano.user(username);
     var rev = '';
     user.insert({_id:playlistname, songs:[], type:"playlist"},function(err, body) {
        if (!err)
            cb(null,body);
        });
}



exportsHandler.addTracks = function(tracks, playlist, username,  callback) {
    var user = nano.use(username);
    var rev ='';
    var tracksArray = []
    user.get(playlist, function(err, data) {
                    if (err) {return callback(err,null)}
                    else{
                        rev=data._rev;
                        tracksArray = data.songs;
                        if(!(tracks instanceof Array)){
                            tracksArray.push(tracks);
                            user.insert({_id:playlist, _rev:rev, type:'playlist',songs:tracksArray},function(error,data){
                                if(error)callback(error,null);
                                else {
                                 callback(null,data);
                                }
                            })
                        } else{
                            var result = tracksArray.concat(tracks);
                            user.insert({_id:playlist, _rev:rev, type:'playlist', songs:result},function(error,data){
                                if(error)callback(error,null);
                                else {
                                    console.log(null,data);
                                }
                            });
                            callback(null,data)
                        }
                    }
                });

}



module.exports= exportsHandler;