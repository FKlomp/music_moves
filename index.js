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
    online: true,
    mongoDB: null,
    localDB: {},
    artistIds: [],
    preload: {},
    init: function () {
        echonest.init(config.ECHONEST_API_KEY);
        
        this.preload.load_mongo = this.loadMongoDB.bind(this);
        this.preloadCollection('artists')
        
        async.series(this.preload,
        function(err, results) {
            this.loadArtistIds();
                        
            if (err) {
                console.log('Error initializing server...', err, results)
            } else {
                console.log('Ready...', results)
                
                this.startServer();
            }
        }.bind(this));
    },
    
    loadMongoDB: function (callback) {
        if (this.online) {
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
        } else {
            mongoClient.connect(config.LOCAL_MONGODB, function(err, db) {
                if (err) {
                    callback(err)
                    this.exit();
                } else {
                    console.log('Connected to local MongoDB...');
                    
                    this.mongoDB = db;
                    
                    callback(null, true);
                }
            }.bind(this));
        }
    },
    
    preloadCollection: function (collection) {
        this.localDB[collection] = new nedb({ filename: 'data/' + collection });
        this.preload['load_' + collection] = function(callback) {
            this.localDB[collection].loadDatabase(function (err) {
                if (err) {
                    callback(err)
                } else {
                    callback(null, true);
                } 
            });
        }.bind(this);
    },
    
    loadArtistIds: function () {
        this.localDB.artists.find({}, function (err, docs) {
            if (err) {
                console.log(err)
            } else {
                for (var i = 0; i < docs.length; i++) {
                    if (docs[i].foreign_ids && docs[i].foreign_ids[0] && docs[i].foreign_ids[0].catalog === 'musicbrainz') {
                        this.artistIds.push(docs[i].foreign_ids[0].foreign_id.replace('musicbrainz:artist:', ''));
                    }
                }
            } 
        }.bind(this));
    },
    
    startServer: function () {
        app.use(express.static('public'));
        
        app.get('/api', function (req, res) {
            res.send('API works!');
        }.bind(this));
        
        app.get('/api/echonest', echonestMiddleware(config.ECHONEST_API_KEY))
        
        app.get('/api/streamwatch/artist/country', function (req, res) {
            var match = {},
                aggregate = [{
                    $group: { _id: "$country", count: { $sum: "$count" }, population: { $first: "$population" }}
                }];
            
            if (req.query.mbId) {
                match.mbId = req.query.mbId;
            } else if (this.online) {
                match.mbId = { $in: this.artistIds };
            }
            
            if (Object.keys(match).length > 0) {
                aggregate.unshift({
                    $match: match
                });
            }
            
            this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));
        
        app.get('/api/streamwatch/song/country', function (req, res) {
            var match = {},
                aggregate = [{
                    $group: { _id: "$country", count: { $sum: "$count" }, population: { $first: "$population" }}
                }];
            
            if (this.online) {
                match['artists.mbId'] = { $in: this.artistIds };
            }
                
            if (req.query.song) {
                match.song = new RegExp(req.query.song, 'i');
            }
            
            if (Object.keys(match).length > 0) {
                aggregate.unshift({
                    $match: match
                });
            }

            this.mongoDB.collection('song_stats_geo', function(err, collection) {
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));
        
        app.get('/api/streamwatch/artist', function (req, res) {
            var query = {};
            
            if (req.query.q) query['lastfm_info.artist.name'] = new RegExp(req.query.q, 'i');
            
            
            this.mongoDB.collection('artist_info', function(err, collection) {
                collection.find(query).limit(20).toArray(function(err, docs) {
                    res.json(docs);
                });
            });
              
        }.bind(this));
        
        app.get('/api/streamwatch/song', function (req, res) {
            var query = {}
            
            if (req.query.q) query.song = new RegExp(req.query.q, 'i');
            
            if (this.online) {
                query.artistMbId = { $in: this.artistIds };
            }
            this.mongoDB.collection('song_info', function(err, collection) {
                collection.find(query).limit(20).toArray(function(err, docs) {
                    res.json(docs);
                });
            });
        }.bind(this));





        app.get('/api/streamwatch/dates/country', function (req, res) {
            var time = new Date(req.query.timeline)
            var match = {},
            aggregate = [{   
                $match : { 
                      date : time
                   } },
                {   
                    $group: { _id : "$country", count: { $sum: "$count" }}
                }];            
            if (req.query.mbId) {
                match.mbId = req.query.mbId;
            } else if (this.online) {
                match.mbId = { $in: this.artistIds };
            }

            if (Object.keys(match).length > 0) {
                aggregate.unshift({
                    $match: match
                });
            }

            aggregate[0]["$match"].date = aggregate[1]["$match"].date;
            aggregate[1] = aggregate[2];
            aggregate.pop();

            if (req.query.mbId) {
                aggregate[0]["$match"].mbId = req.query.mbId;
            }

            //TODO: SONG

            this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
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