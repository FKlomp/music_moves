var nedb = require('nedb'),
    db = {}; 

db.artists = new nedb({ filename: 'data/artists' });

db.artists.loadDatabase(function (err) {
    db.artists.find({}, function (err, docs) {
        console.log(docs[0])
        console.log(docs.length)
    });
});