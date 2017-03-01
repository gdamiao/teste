'use strict'

var Album = require('./model/Album.js');
var Artist = require('./model/Artist.js');
var Track = require('./model/Track.js');
var service = require('../service/service.js');
var handlebars = require('handlebars');
var fs = require('fs');

const cachePath = './cache/'

const spotifyURL = "https://api.spotify.com/v1/";
const searchURL = "search?q="
const searchURL_ARTIST_TYPE_ONLY = "&type=artist"
const searchURL_ALBUM_TYPE_ONLY = "&type=album"
const searchURL_ALBUM_ARTIST_TYPE = "&type=artist,album"
const searchURL_OFFSET = "&offset="
const searchURL_LIMIT = "&limit="
const artistURL= "artists/";
const albumsURL = "/albums";
const albumsURL_word = "albums";
const tracksURL = "/tracks";
const offsetsURL = "&offset=&limit=4";

const dbutils = require('./model/DButils.js')


var firstTimeSearch = false;

var path = require('path');

console.log(path.resolve('./controller/view/searchView.hbs')); 


//standart views
const searchViewLogged = handlebars.compile(fs.readFileSync('./controller/view/searchViewLogged.hbs').toString())
const searchView = handlebars.compile(fs.readFileSync('./controller/view/searchView.hbs').toString())
const artistView = handlebars.compile(fs.readFileSync('./controller/view/artistView.hbs').toString());
const artistViewLogged = handlebars.compile(fs.readFileSync('./controller/view/artistViewLogged.hbs').toString());
const tracksView = handlebars.compile(fs.readFileSync('./controller/view/tracksView.hbs').toString());
const tracksViewLogged = handlebars.compile(fs.readFileSync('./controller/view/tracksViewLogged.hbs').toString());
const addingTracksView = handlebars.compile(fs.readFileSync('./controller/view/addingTracks.hbs').toString());


//ajax views

const songsDiv = handlebars.compile(fs.readFileSync('./controller/view/viewAJAX/songsdiv.hbs').toString());
const playlistsDiv = handlebars.compile(fs.readFileSync('./controller/view/viewAJAX/playlistsdiv.hbs').toString());
const sharedsongsDiv = handlebars.compile(fs.readFileSync('./controller/view/viewAJAX/sharedsongsDiv.hbs').toString());

const exportHandler = {};
var cache ={}
var offset = 0;
var limit = 20;



exportHandler.search = function(toSearchId, username, callback){

		var artistsObj = {};
		artistsObj.artists = [];
		artistsObj.searchID =toSearchId;
		artistsObj.id ='';
		
		var cacheFileID = '';
		if(!(username!=null)) cacheFileID = toSearchId+";offset="+offset;
		
		if(firstTimeSearch){
			offset=0;
		}else
		firstTimeSearch=true;
		
		console.log(offset);
		console.log(limit);
		
		if(!(username!=null)){
			if(verifyCache(cacheFileID, callback, offset)) return;}
		

		
		service( spotifyURL+
				 searchURL+
				 toSearchId+
				 searchURL_ARTIST_TYPE_ONLY+
				 searchURL_OFFSET+offset+
				 searchURL_LIMIT+limit,  function(error, data){
				
					if(error) callback(error, null);
					else{
						var dataObj = JSON.parse(data);
						var items = dataObj.artists.items;
						
						if(items.length===0 && offset!=0){
							var aux = cacheFileID.split('=');
							aux[aux.length-1]=offset-limit;
							cacheFileID = aux.join('=');
							callback(null, cache[cacheFileID]);
						}else{
							items.forEach( ar => artistsObj.artists.push(new Artist(ar)));

							let result = '';
							if(username){
								artistsObj.id = String(username);
								result = searchViewLogged(artistsObj);
							}else result = searchView(artistsObj);
							
							if(!(username!=null)){
								cache[cacheFileID] = result;
								createCacheFile(cacheFileID, result);
							}

							callback(null, result);
						}
						
					
				
				}
		});	
}
exportHandler.artists = function(artistID, username, callback){
			
			var artistPlusAlbuns = {};
			artistPlusAlbuns.id=username;
			var albums = [];
			let artist = {};
			
			if(!(username!=null)){if(verifyCache(artistID, callback)) return;}
			
			service(spotifyURL + artistURL + artistID, function(error, data){
			if(error) callback(error,null);
			else{
				var dataObj = JSON.parse(data);
				artist = new Artist(dataObj);

				
				service(spotifyURL + artistURL + artistID + albumsURL, function(error, data){
				if(error) callback(error,null);
				else{
					var dataObj = JSON.parse(data);
					var items = dataObj.items;
					items.forEach( ar => albums.push(new Album(ar)));
					
					artistPlusAlbuns.artist = artist;
					artistPlusAlbuns.albums = albums;
					
					let result = '';
					
					if(username!=null) result = artistViewLogged(artistPlusAlbuns);
					else result =artistView(artistPlusAlbuns);
						
					if(!(username!=null)){
						cache[artistID] = result;
						createCacheFile(artistID, result);
					}
					
					callback(null, result);
				}
				})
			}
		});	
}


exportHandler.albumTracks = function(albumID, username, callback){
			
			var albunsPlusTracks = {};
			albunsPlusTracks.id=username;
			var tracksInfo = [];
			let albumInfo = {};
			var playlistsdata =[];
			
			if(!(username!=null)){if(verifyCache(albumID, callback)) return;}
			service(spotifyURL + albumsURL_word + "/" + albumID, function(error, data){
			if(error) callback(error,null);
			else{
				var dataObj = JSON.parse(data);
				albumInfo = new Album(dataObj);

				var teste= spotifyURL + albumsURL_word +"/"+ albumID + tracksURL;
				service(spotifyURL + albumsURL_word +"/"+ albumID + tracksURL, function(error, data){
				if(error) callback(error,null);
				else{
					var dataObj = JSON.parse(data);
					var items = dataObj.items;
					items.forEach( ar => tracksInfo.push(new Track(ar)));
					
					albunsPlusTracks.album = albumInfo;
					albunsPlusTracks.tracks = tracksInfo;
					
					let result = '';
					
					if(username!=null) 
						result = tracksViewLogged(albunsPlusTracks);
					else result =tracksView(albunsPlusTracks);
						
					if(!(username!=null)){
						cache[albumID] = result;
						createCacheFile(albumID, result);
					}

					callback(null, result);
				}
				})
			}
		});	
}



exportHandler.addToPlayList = function(albumID, username, callback){
			

			var addingTracks = {};
			addingTracks.id=username;
			var tracksInfo = [];
			let albumInfo = {};
			var playlists = [];
			
			dbutils.listPlaylists(username,function(err, playlistsdata){
				if(err) return callback(err,null);
				service(spotifyURL + albumsURL_word + "/" + albumID, function(error, data){
				if(error) callback(error,null);
				else{
					var dataObj = JSON.parse(data);
					albumInfo = new Album(dataObj);

					var teste= spotifyURL + albumsURL_word +"/"+ albumID + tracksURL;
					service(spotifyURL + albumsURL_word +"/"+ albumID + tracksURL, function(error, data){
					if(error) callback(error,null);
					else{
						var dataObj = JSON.parse(data);
						var items = dataObj.items;
						items.forEach( ar => tracksInfo.push(new Track(ar)));
						
						addingTracks.album = albumInfo;
						addingTracks.tracks = tracksInfo;
						addingTracks.playlists = playlistsdata;
						
						let result = '';
						
						if(username!=null) result = addingTracksView(addingTracks);
						else result =addingTracksView(addingTracks);
							
						
						callback(null, result);
					}
					})
				}
			});
		});	
}


exportHandler.getSongsDiv = function(username, playlist, callback){
	dbutils.listPlaylistSongs(username,playlist, function(err, data){
		if(err) 
			{
				callback(err,null);
			}
		else
			{
				let result = songsDiv({songs:data});
				aux=-1;
				callback(null,result);
			}
    });
}

exportHandler.getSharedSongsDiv = function(username, playlist, callback){
	dbutils.listPlaylistSongs(username,playlist, function(err, data){
		if(err) 
			{
				callback(err,null);
			}
		else
			{
				let result = sharedsongsDiv({songs:data});
				callback(null,result);
			}
    });
}



exportHandler.createPlaylist = function(username, playlist, callback){
	dbutils.createPlaylist(username, playlist, function(error, body){
		if(error) 
			{
				callback(error,null);
			}
		else
			{
				callback(null,"Playlist created succesfully");
			}
    });
}

exportHandler.deletePlaylist = function(username, playlist, callback){
	dbutils.deletePlaylist(username, playlist, function(error, body){
		if(error) 
			{
				callback(error,null);
			}
		else
			{
				callback(null,"Playlist deleted succesfully");
			}
    });
}

exportHandler.renamePlaylist = function(username, oldname,newname, callback){
	dbutils.renamePlaylist(username, oldname,newname, function(error, body){
		if(error) 
			{
				callback(error,null);
			}
		else
			{
				callback(null,"Playlist renamed succesfully");
			}
    });
}

exportHandler.playlistsRefresh = function(username, callback){
		dbutils.listPlaylists(username, function(err, data){
		if(err) 
			{
				callback(err,null);
			}
		else
			{
				let result = playlistsDiv({playlists:data});
				callback(null,result);
			}
	})
}

exportHandler.getPlayList = function(username, callback){
		var playlists =[];
		dbutils.listPlaylists(username, function(err, data){
		if(err) 
			{
				console.log("error on controller getplaylist");
				callback(err,null);
			}
		else
			{	
				playlists=data;
				dbutils.listReadPlaylists(username, function(error, body){
					if(error){
						console.log("error on listing read only playlists in controller")
						callback(error,null);
					}else{
						playlists = playlists.concat(body);
						callback(null,playlists);
					}
				})
			}
	})
}

exportHandler.deleteSongs = function(username, playlist, songs, callback){
	dbutils.deleteSongs(username,playlist, songs, function(err, data){
		if(err) 
			{
				callback(err,null);
			}
		else
			{
				callback(null,data);
			}
    });
}

exportHandler.sendShareInvite = function(username, shareuser, shareplaylist, permission, callback){
	dbutils.createShareInvite(username,shareuser, shareplaylist,permission, function(err, data){
		if(err) 
			{
				console.log("error in controller sendShareInvite");
				callback(err,null);
			}
		else
			{
				callback(null,data);
			}
    });
}

exportHandler.getUserInvitesNumber = function(username, cb){
	dbutils.getUserInvitesNumber(username, function(err, data){
		if(err) 
			{
				console.log("error in controller getUserInvites");
				cb(err,null);
			}
		else
			{
				cb(null,data);
			}
	})
}

exportHandler.deleteSharingInvitation = function (username, invitation, cb){
	dbutils.deleteSharingInvitation(username, invitation, function(err,data){
		if(err) 
			{
				console.log("error in controller deleteSharingInvitation");
				cb(err,null);
			}
		else
			{
				cb(null,"ok");
			}
	})
}

exportHandler.acceptSharingInvitation = function (username, invitation, cb){
	dbutils.sharedPlayListCreation(username, invitation, function(err,data){
		if(err) 
			{
				console.log("error in controller acceptSharingInvitation");
				cb(err,null);
			}
		else
			{
				dbutils.createSharedPlaylistReference(username, invitation, function(error, resp){
					if(error){ 
						console.log("error on controller createSharedPlaylistReference")
						cb(error,null);
					}
					else{
						cb(null,"ok");
					}
				})
			}
	})
}

exportHandler.unshareUser = function(username, shareuser, playlist, cb){
	dbutils.unshareUser( username, shareuser, playlist, function(err,data){
		if(err) 
			{
				console.log("error in unshareUser");
				cb(err,null);
			}
		else
			{
				cb(null,"ok");
			}
	})
}

exportHandler.getUserInvitesObjects = function(username, cb){
	dbutils.getUserInvitesObjects(username, function(err,data){
		if(err) 
			{
				console.log("error in controller getUserInvitesObjects");
				cb(err,null);
			}
		else
			{
				cb(null,data);
			}
	})
}







//1 and 2nd fase


exportHandler.home = function(blankQuerry, callback){

}

exportHandler.searchNext = function(toSearchId, username, callback){
	firstTimeSearch = false;
	console.log("entered next");
	offset = offset+limit;
	exportHandler.search(toSearchId, username, callback);
	return
}
exportHandler.searchPrevious = function(toSearchId, username, callback){
	firstTimeSearch=false;
	console.log("entered previous");
	if(offset>=limit) offset = offset-limit;
	exportHandler.search(toSearchId, username, callback);
	return
}



function verifyCache(id, callback){
	
	if(cache.hasOwnProperty(id)){
		callback(null, cache[id]);
		return true;
	}
	else if(fileInCache(id)){
		callback(null, cache[id]);
		return true;
	}
	return false;
}

function fileInCache(id){
	let path = cachePath + id + ".txt";
	if (fs.existsSync(path)) { 
		var content = fs.readFileSync(path, "utf8");
		cache[id] = content;
		return true;
	}
	return false;

}

function createCacheFile(id, content){
	let path = cachePath + id + ".txt";
	fs.openSync(path, "w")
	fs.writeFileSync(path, content);
	return;
}


//HELPERS

var aux = -1;
handlebars.registerHelper("inc", function(options)
{   
	aux=aux+1;
	return aux;
});


module.exports = exportHandler;
