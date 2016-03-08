var nedb = require('nedb'),
    db = {}; 

db.songs = new nedb({ filename: 'data/songs' });

db.songs.loadDatabase(function (err) {
    db.songs.find({}, function (err, docs) {
        console.log(docs[0])
        console.log(docs.length)
    });
});