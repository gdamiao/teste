'use strict';

function Album(object){
	this.href = object.href ;
	this.name = object.name;
	this.album_type = object.album_type ;
	this.id = object.id ;
	
	this.genres = object.genres;
	this.url
	this.height 
	this.width
			
	if(object.images!= null){
		if(object.images[0]!=null){
			this.url = object.images[0].url;
		}
	}

}

module.exports = Album;