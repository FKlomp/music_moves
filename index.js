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
        
        app.get('/api/streamwatch/country/toptags', function (req, res) {
            var match = {},
                aggregate = [{
                    $lookup: {
                        from: 'artist_info',
                        localField: 'mbId',
                        foreignField: 'mbId',
                        as: 'artist_info' }
                },{ 
                    $project : {tags: "$artist_info.lastfm_info.artist.tags.tag"}
                },{ 
                    $unwind : "$tags"
                },{ 
                    $unwind : "$tags"
                },{
                    $group: { 
                        _id: "$tags.name",
                        count: { $sum: 1 }
                    }
                },{
                    $sort: { count: -1 }
                },{
                    $limit: 15
                }];
            
            if (this.online) {
                match.mbId = { $in: this.artistIds };
            }
                            
            if (req.query.q) {
                match.country = req.query.q;
            }
            
            if (Object.keys(match).length > 0) {
                aggregate.unshift({
                    $match: match
                });
            }
            
            this.mongoDB.collection('artist_stats_geo', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));
        
        app.get('/api/streamwatch/country/topartists', function (req, res) {
            var match = {},
                aggregate = [{
                    $group: { 
                        _id: "$mbId", 
                        count: { $sum: "$count" } }
                },{
                    $lookup: {
                        from: 'artist_info',
                        localField: '_id',
                        foreignField: 'mbId',
                        as: 'artist_info' }
                },{
                    $sort: { count: -1 }
                },{
                    $limit: 5
                }];
            
            if (this.online) {
                match.mbId = { $in: this.artistIds };
            }
                            
            if (req.query.q) {
                match.country = req.query.q;
            }
            
            if (Object.keys(match).length > 0) {
                aggregate.unshift({
                    $match: match
                });
            }
            
            this.mongoDB.collection('artist_stats_geo', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));
        
        app.get('/api/streamwatch/country/topsongs', function (req, res) {
            var match = {},
                aggregate = [{
                    $unwind: "$artists"
                },{ 
                    $group: {
                        _id: { song: "$song", mbId: "$artists[0].mbId" },
                        artist: { $first: "$artists" },
                        count: { $sum: "$count" } }
                },{
                    $sort: { count: -1 }
                },{
                    $limit: 5
                }];
            
            if (this.online) {
                match['artists.mbId'] = { $in: this.artistIds };
            }
                            
            if (req.query.q) {
                match.country = req.query.q;
            }
            
            if (Object.keys(match).length > 0) {
                aggregate.unshift({
                    $match: match
                });
            }
            
            this.mongoDB.collection('song_stats_geo', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));
        
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
            
            this.mongoDB.collection('artist_stats_geo', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));
        
        app.get('/api/streamwatch/artist/monthly', function (req, res) {
            var match = {},
                aggregate = [],
                date = {};
            
            if (req.query.mbId) {
                match.mbId = req.query.mbId;
            } else if (this.online) {
                match.mbId = { $in: this.artistIds };
            }
            
            if (!match.mbId) {
                aggregate.push({
                    $group: { 
                        _id: "$date",
                        date: { $first: "$date" },
                        count: { $sum: "$count" }
                    }
                });
            }
            
            if (req.query.begin) {
                date["$gte"] = new Date(req.query.begin);
            }
            
            if (req.query.end) {
                date["$lte"] = new Date(req.query.end);
            }
            
            if (Object.keys(date).length > 0) {
                match.date = date;
            }
            
            if (req.query.country) {
                match.country = req.query.country;
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
            
            if (this.online) {
                query.mbId = { $in: this.artistIds };
            }
            
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
            var time = new Date(req.query.timeline),
                match = {date: time},
                aggregate = [{   
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

            //TODO: SONG

            this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));


        app.get('/api/streamwatch/tour/country', function (req, res) {

            var continent = req.query.continent.split(","),
                match = {},
                aggregate = [{   
                    $group: { _id : "$country", count: { $sum: "$count" }}
                },
                { $sort : { count : -1} }];

            if (continent[0] === '') {
                var continents = "AS EU AF NA SA OC AN";
                continent = continents.split(" ");
            }
            
            match.continent = { $in: continent};

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
            //TODO: SONG
            this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));


        app.get('/api/streamwatch/tour/song', function (req, res) {
            var continent = req.query.continent.split(","),
                match = {},
                aggregate = [
                {   
                    $group: { _id : "$song", count: { $sum: "$count" }}
                },
                { $sort : { count : -1} }];

            if (continent[0] === '') {
                var continents = "AS EU AF NA SA OC AN";
                continent = continents.split(" ");
            }
            
            match.continent = { $in: continent};

            if (req.query.mbId) {
                match['artists.mbId'] = req.query.mbId;
            } else if (this.online) {
                match['artists.mbId'] = { $in: this.artistIds };
            }

            if (Object.keys(match).length > 0) {
                aggregate.unshift({
                    $match: match
                });
            }
            //TODO: SONG

            this.mongoDB.collection('song_stats_geo_monthly', function(err, collection) {
                if(err) res.send(err);
                
                collection.aggregate(aggregate).limit(5).toArray(function(err, docs) {
                    if(err) res.send(err);
                    
                    res.json(docs);
                });
            }.bind(this));
        }.bind(this));

        app.get('/api/streamwatch/tour/song/info', function (req, res) {
            var query = {}
            var songs = req.query.song.split(",");

            if (req.query.song) query.song = { $in: songs};
            if (req.query.mbId) query['artists.mbId'] = new RegExp(req.query.mbId, 'i');
            //console.log(query);
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