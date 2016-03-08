var ECHONEST_API_KEY = 'HDNARBZW0CIKBUY2R';

var nedb = require('nedb'),
    echonest = require('echonestjs'),
    reqPerMinute = 20,
    start = 0,
    results = 100,
    db = {},
    finished = false;

db.artists = new nedb({ filename: 'data/artists' });

echonest.init(ECHONEST_API_KEY);

function addNextBatch () {
    console.log('Retrieve artists ' + start + ' to ' + (start + results) + '...')
    
    echonest.get('artist/search',{
        artist_location: 'city:amsterdam',
        bucket: ['doc_counts', 'genre', 'images', 'artist_location', 'songs', 'terms', 'id:musicbrainz'],
        start: start,
        results: results
    }, function (err, res) {
        if(err) console.log(err);
        
        var resultCount = res.response.artists.length
        
        console.log('Retrieved ' + resultCount + ' artists...')
        if( resultCount > 0 ) {
            for (var i in res.response.artists) {
                
                var artist = res.response.artists[i];
                
                db.artists.update({ foreign_ids: { $elemMatch: { foreign_id: artist.foreign_ids[0].foreign_id } } }, artist, { upsert: true }, function (err, numReplaced) {
                    if(err) console.log(err);
                });
            }
            
            start += parseInt(results);
        } else {
            console.log(res.response);
            finished = true;
        }
        
        if (!finished) {
            setTimeout(addNextBatch, 10000);
        } else {
            console.log('Finished...')
        }
    });
}

db.artists.loadDatabase(function (err) {
    addNextBatch();
});