function tourData(){
	if(searchBar.currentArtist !== null){
	        url = 'api/streamwatch/tour/song/?continent=' + continentSelected + '&mbId=' + searchBar.currentArtist;
	    }else {
	        url = 'api/streamwatch/tour/song/?continent=' + continentSelected;
	    }
	var promise = new Promise(function(resolve, reject) {
	        d3.json(url, function(err, data) {
	            (err) ? reject(err) : resolve(data);
	        });
	}).then(function (data) {
	    var amountTopSongs = 5;

	    var tourNameSongs = [];
	    var tourSongName = '';

	    for(var i = 0; i < amountTopSongs; i++) {
	    	if(i < data.length) {
	        	document.getElementById('tourSongs').rows[i].cells[0].innerHTML = data[i]['_id'];
	        	tourNameSongs.push(data[i]['_id']);

	    	} else{
				document.getElementById('tourSongs').rows[i].cells[0].innerHTML = '-';
	    	}
	    }

		url2 = '/api/streamwatch/tour/song/info?song=' + tourNameSongs + '&mbId=' + searchBar.currentArtist;
		console.log(url2);
		var promise2 = new Promise(function(resolve, reject) {
			d3.json(url2, function(err, data) {
				(err) ? reject(err) : resolve(data);
			});
		}).then(function (data) {

			console.log(data);
			for(var i = 0; i < tourNameSongs.length; i++) {
				var index = tourNameSongs.indexOf(data[i].song);
				document.getElementById('tourSongs').rows[index].cells[1].innerHTML = data[i].videoId;
			}
	 	});
	 });
}
function tourSongInfo(songlist){
	console.log(songlist);
	console.log(this);
	console.log(this.rowIndex);

	var mbId = searchBar.currentArtist;
}

function tourCountries(data){
	var countries = data;
		for(var i = 0; i < 5; i++) {
	    	if(i < data.length) {
	        	document.getElementById('tourStops').rows[i].cells[1].innerHTML = data[i];
	    	} else{
				document.getElementById('tourStops').rows[i].cells[1].innerHTML = '-';
	    	}
	    }

}