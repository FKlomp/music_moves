var nedb = require('nedb'),
    db = {}; 

db.artists = new nedb({ filename: 'data/artists' });

db.artists.loadDatabase(function (err) {
    db.artists.find({}, function (err, docs) {

	//console.log(docs[0]);
	var querystart = 'db.song_stats_geo_monthly.find({ "artists.name": { $in: [';
	var queryend = "] } })";
	var querystring = ''
	var nextstring = ', '


	querystring = querystring.concat(querystart);
	for(var i = 0; i<docs.length; i++) {
        	//console.log(docs[i]['name']);
		var artistname = docs[i]["name"];
		artistname = artistname.replace( /"/g, '/"').replace( /'/g, "/'").replace( /&/g, '/&');
		artistname = artistname.replace(/"/g, "").replace(/'/g, "").replace(/\(|\)/g, "");

		querystring = querystring.concat('"' + artistname + '"');
		if(i !== docs.length) {	
			querystring = querystring.concat(nextstring);
		}
	}
	querystring = querystring.concat(queryend);
	console.log(querystring);
    });
});

