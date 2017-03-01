var http = require('https');

function getRequest(url, callback){ 
	http.get(url, function(request) {
	var data = '';
	request.on('data', d => data += d);
	request.on('error', err => callback(err, null));
	request.on('end', () => callback(null, data));
})}


module.exports = getRequest;