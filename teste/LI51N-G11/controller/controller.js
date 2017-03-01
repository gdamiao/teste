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

const searchView = handlebars.compile(fs.readFileSync('./controller/view/searchView.hbs').toString())
const searchViewLogged = handlebars.compile(fs.readFileSync('./controller/view/searchViewLogged.hbs').toString())
const artistView = handlebars.compile(fs.readFileSync('./controller/view/artistView.hbs').toString());
const artistViewLogged = handlebars.compile(fs.readFileSync('./controller/view/artistViewLogged.hbs').toString());
const tracksView = handlebars.compile(fs.readFileSync('./controller/view/tracksView.hbs').toString());
const tracksViewLogged = handlebars.compile(fs.readFileSync('./controller/view/tracksViewLogged.hbs').toString());
const addingTracksView = handlebars.compile(fs.readFileSync('./controller/view/addingTracks.hbs').toString());
const songsDiv = handlebars.compile(fs.readFileSync('./controller/view/viewAJAX/songsdiv.hbs').toString());

const exportHandler = {};
var cache ={}
var offset = 0;
var limit = 20;


exportHandler.init = function(){
	var initString = dbutils.createSharedPlaylistsBD(function(err,data){
		if(err) console.log("erro: "+ err);
		else{
			console.log(data);
		}
	});

}
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
				callback(null,result);
			}
    });
}
















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



module.exports = exportHandler;
