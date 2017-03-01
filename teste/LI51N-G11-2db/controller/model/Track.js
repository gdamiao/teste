'use strict';

function Track(object){
	this.href = object.href ;
	this.name = object.name;
	this.artist = object.artists[0].name;
	this.track_number = object.track_number ;
	this.id = object.id ;
	this.disc_number = object.disc_number;
	
    this.description = this.artist+" - Disco "+ this.disc_number +" Track "+this.track_number+" : "+this.name;

}

module.exports = Track;