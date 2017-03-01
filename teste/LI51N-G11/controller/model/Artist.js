
function Artist(object){
	this.href = object.href ;
	this.name = object.name;
	this.genres = object.genres ;
	this.id = object.id ;
	this.popularity = object.popularity ;
	this.followers = object.followers;
	
	
	this.url;
	if(object.images[0]!=null){
			this.url = object.images[0].url;
	}else{
		this.url = "http://www.instrumentationtoday.com/wp-content/themes/patus/images/no-image-half-landscape.png"
		}

}

module.exports = Artist;