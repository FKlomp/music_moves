function tourData(){


if(searchBar.currentArtist !== null){
        url = 'api/streamwatch/tour/song?continent=' + continentSelected + '&mbId=' + searchBar.currentArtist;
    }else {
        url = 'api/streamwatch/tour/song?continent=' + continentSelected;
    }

var promise = new Promise(function(resolve, reject) {
        d3.json(url, function(err, data) {
            (err) ? reject(err) : resolve(data);
        });
}).then(function (data) {
    var amountTopSongs = 5;
    for(var i = 0; i < amountTopSongs; i++) {
    	if(i < data.length) {
        	document.getElementById('tourSongs').rows[i].cells[0].innerHTML = data[i]['_id'];
    	} else{
			document.getElementById('tourSongs').rows[i].cells[0].innerHTML = '-';
    	}
    
    }

 });
}