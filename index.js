var nedb = require('nedb'),
    config = require('./config'),
    async = require('async'),
    express = require('express'),
    csv = require('express-csv'),
    echonest = require('echonestjs'),
    echonestMiddleware = require('echonest-middleware'),
    mongoClient = require('mongodb').MongoClient,
    app = express();

var Server = {
    mongoDB: null,
    localDB: null,
    artistIds: [],
    init: function () {
        echonest.init(config.ECHONEST_API_KEY);
        
        this.localDB = {
            artists: new nedb({ filename: 'data/artists' })
        };
        
        // an example using an object instead of an array
        async.series({
            loadArtistDB: function(callback) {
                this.localDB.artists.loadDatabase(function (err) {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, true);
                    } 
                });
            }.bind(this),
            loadArtists: function (callback) {
                this.localDB.artists.find({}, function (err, docs) {
                    if (err) {
                        callback(err)
                    } else {
                        for (var i = 0; i < docs.length; i++) {
                            if (docs[i].foreign_ids && docs[i].foreign_ids[0] && docs[i].foreign_ids[0].catalog === 'musicbrainz') {
                                this.artistIds.push(docs[i].foreign_ids[0].foreign_id.replace('musicbrainz:artist:', ''));
                            }
                        }
                    
                        callback(null, true);
                    } 
                }.bind(this));
            }.bind(this),
            loadMongoDB: function(callback) {
                mongoClient.connect(config.MONGODB_URL, function(err, db) {
                    if (err) {
                        callback(err)
                        this.exit();
                    } else {
                        console.log('Connected to MongoDB...');

                        db.authenticate(config.MONGODB_USERNAME, config.MONGODB_PASSWORD, function(err, result) {
                            if (err) {
                                callback(err)
                                this.exit();
                            } else {
                                console.log('Successfully authenticated MongoDB...');
                                this.mongoDB = db;
                                
                                callback(null, true);
                            }
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this)
        },
        function(err, results) {
            if (err) {
                console.log('Error initializing server...', err, results)
            } else {
                console.log('Ready...', results)
                
                this.startServer();
            }
        }.bind(this));
    },
    
    startServer: function () {
        app.use(express.static('public'));
        
        app.get('/api', function (req, res) {
            res.send('API works!');
        }.bind(this));
        
        app.get('/api/echonest', echonestMiddleware(config.ECHONEST_API_KEY))
        
        app.get('/api/streamwatch/artist', function (req, res) {
            var query = {
                mbId: { $in: this.artistIds }
            }
            
            if (req.query.q) query['lastfm_info.artist.name'] = new RegExp(req.query.q, 'i');

            this.mongoDB.collection('artist_info', function(err, collection) {
                collection.find(query).toArray(function(err, docs) {
                    res.json(docs);
                });
            });
        }.bind(this));
        
        app.get('/api/streamwatch/song', function (req, res) {
            var query = {
                artistMbId: { $in: this.artistIds }
            }
            
            if (req.query.q) query.song = new RegExp(req.query.q, 'i');

            this.mongoDB.collection('song_info', function(err, collection) {
                collection.find(query).toArray(function(err, docs) {
                    res.json(docs);
                });
            });
        }.bind(this));
        
        app.listen(3000, function () {
            console.log('App listening on port 3000!');
        });
    },
    
    exit: function () {
        this.mongoDB.close();
        
        process.exit()
    }
}

Server.init();