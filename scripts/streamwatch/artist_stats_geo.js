var config = require('../../config'),
    nedb = require('nedb'),
    MongoWritableStream = require('mongo-writable-stream'),
    MongoClient = require('mongodb').MongoClient,
    artistIds = [],
    query = { mbId: { $in: artistIds } },
    collection = 'artist_stats_geo',
    upsertFields = ['externalId'];

var db = {
    artists: new nedb({ filename: 'data/artists', autoload: true})
}

db.artists.find({}, function (err, docs) {
    if (err) {
        console.log(err)
    } else {
        for (var i = 0; i < docs.length; i++) {
            if (docs[i].foreign_ids && docs[i].foreign_ids[0] && docs[i].foreign_ids[0].catalog === 'musicbrainz') {
                artistIds.push(docs[i].foreign_ids[0].foreign_id.replace('musicbrainz:artist:', ''));
            }
        }
        
        writeDocs();
    } 
});

function writeDocs () {
    console.log('Artists: ', artistIds.length)
    var writeStream = new MongoWritableStream({
    	url: 'mongodb://localhost/npdemo',
    	collection: collection,
    	upsert: true,
    	upsertFields: upsertFields
    });

    MongoClient.connect(config.MONGODB_URL, function(err, db) {
        if (err) {
            console.log(err)
        } else {
            db.authenticate(config.MONGODB_USERNAME, config.MONGODB_PASSWORD, function(err, result) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Successfully authenticated MongoDB...');
                    
                    var col = db.collection(collection);
                    var stream = col.find(query).stream();
                    
                    console.log('Start writing...')
                    stream.on('data', function(doc) {
                        doc.externalId = doc._id;
                        delete doc._id;
                        
                        writeStream.write(doc);
                        
                        stream.pause();

                        setTimeout(function() {
                            stream.resume();
                        }, 1);
                    });
                    
                    stream.on('error', function (err) {
                        console.error(err)
                    })

                    stream.on('end', function() {
                        db.close();
                        writeStream.end();
                        console.log('finished...')
                    });
                }
            });
        }
    });
}