var ECHONEST_API_KEY = 'HDNARBZW0CIKBUY2R';

var nedb = require('nedb'),
    echonest = require('echonestjs'),
    start = 0,
    results = 5,
    artists = [],
    db = {},
    finished = false;

db.artists = new nedb({ filename: 'data/artists' });
db.songs = new nedb({ filename: 'data/songs' });

echonest.init(ECHONEST_API_KEY);

function addNextBatch () {
    console.log('Process artists ' + start + ' to ' + (start + results) + '...')
    
    for (var i = start; i < (start + results); i++) {
        var artist = artists[i];
        
        if (artist){
            echonest.get('song/search',{
                artist_id: artist.id,
                bucket: ['audio_summary', 'id:musicbrainz'],
                sort: 'song_hotttnesss-desc',
                results: 100
            }, function (err, res) {
                if(err) console.log(err);
        
                var resultCount = res.response.songs.length
        
                console.log('Retrieved ' + resultCount + ' songs...')
                if( resultCount > 0 ) {
                    for (var i in res.response.songs) {
                
                        var song = res.response.songs[i];
                
                        db.songs.update({ id: song.id }, song, { upsert: true }, function (err, numReplaced) {
                            if(err) console.log(err);
                        });
                    }
                }
            });
        }
    }
    
    start += results;

    if(start < artists.length) {
        setTimeout(addNextBatch, 30000);
    } else {
        console.log('Finished...');
    }
}

db.artists.loadDatabase(function (err) {
    db.songs.loadDatabase(function (err) {
        db.artists.find({}, function (err, docs) {
            artists = docs;
            console.log('Found ' + docs.length + ' artists...')
            addNextBatch();
        });
    });
});