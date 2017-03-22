var config = require('./config'),
    async = require('async'),
    express = require('express'),
    app = express(),
    JDBC = require('jdbc'),
    jinst = require('jdbc/lib/jinst');

if (!jinst.isJvmCreated()) {
    jinst.addOption("-Xrs");
    jinst.setupClasspath(['./jars/AthenaJDBC41-1.0.0.jar']);
}

var config = {
    url: 'jdbc:awsathena://athena.us-east-1.amazonaws.com:443/',
    drivername: 'com.amazonaws.athena.jdbc.AthenaDriver',
    minpoolsize: 10,
    maxpoolsize: 100,
    properties: {
        s3_staging_dir: 's3://aws-athena-query-results-291838259228-us-east-1/',
        log_path: './logs/athenajdbc.log',
        user: config.ACCESS_KEY,
        password: config.SECRET_KEY
    }
};

var Server = {
    online: false,
    athenaJDBC: null,
    conn: null,
    init: function () {
        this.athenaJDBC = new JDBC(config);
        
        this.athenaJDBC.initialize(function(err) {
            if (err) {
                console.log('Error initializing server...', err)
            } else {
                console.log('Athena initalized...')
                
                this.athenaJDBC.reserve(function(err, connObj) {
                    if (err) {
                        console.log('Error reserving connection: ', err);
                    } else {
                        console.log('Using connection: ' + connObj.uuid);
                
                        this.conn = connObj.conn;
                    }
                }.bind(this));
                
                this.startServer();
            }
        }.bind(this));
    },
    
    performQuery: function () {
        
    },
    
    startServer: function () {
        app.use(express.static('public'));
        
        app.get('/api', function (req, res) {
            res.send('API works!');
        }.bind(this));
//
//         app.get('/api/echonest', echonestMiddleware(config.ECHONEST_API_KEY))
//
//         app.get('/api/streamwatch/country/toptags', function (req, res) {
//             var match = {},
//                 date = {},
//                 aggregate = [{
//                     $lookup: {
//                         from: 'artist_info',
//                         localField: 'mbId',
//                         foreignField: 'mbId',
//                         as: 'artist_info' }
//                 },{
//                     $project : {tags: "$artist_info.lastfm_info.artist.tags.tag"}
//                 },{
//                     $unwind : "$tags"
//                 },{
//                     $unwind : "$tags"
//                 },{
//                     $group: {
//                         _id: "$tags.name",
//                         count: { $sum: 1 }
//                     }
//                 },{
//                     $sort: { count: -1 }
//                 },{
//                     $limit: 15
//                 }];
//
//             if (this.online) {
//                 match.mbId = { $in: this.artistIds };
//             }
//
//             if (req.query.begin) {
//                 date["$gte"] = new Date(req.query.begin);
//             }
//
//             if (req.query.end) {
//                 date["$lte"] = new Date(req.query.end);
//             }
//
//             if (Object.keys(date).length > 0) {
//                 match.date = date;
//             }
//
//             if (req.query.q) {
//                 match.country = req.query.q;
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//         app.get('/api/streamwatch/country/topartists', function (req, res) {
//             var match = {},
//                 date = {},
//                 aggregate = [{
//                     $group: {
//                         _id: "$mbId",
//                         count: { $sum: "$count" } }
//                 },{
//                     $lookup: {
//                         from: 'artist_info',
//                         localField: '_id',
//                         foreignField: 'mbId',
//                         as: 'artist_info' }
//                 },{
//                     $sort: { count: -1 }
//                 },{
//                     $limit: 5
//                 }];
//
//             if (this.online) {
//                 match['artists.mbId']= { $in: this.artistIds };
//             }
//
//             if (req.query.begin) {
//                 date["$gte"] = new Date(req.query.begin);
//             }
//
//             if (req.query.end) {
//                 date["$lte"] = new Date(req.query.end);
//             }
//
//             if (Object.keys(date).length > 0) {
//                 match.date = date;
//             }
//
//             if (req.query.q) {
//                 match.country = req.query.q;
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//         app.get('/api/streamwatch/country/topsongs', function (req, res) {
//             var match = {},
//                 date = {},
//                 aggregate = [{
//                     $unwind: "$artists"
//                 },{
//                     $group: {
//                         _id: { song: "$song", mbId: "$artists[0].mbId" },
//                         artist: { $first: "$artists" },
//                         count: { $sum: "$count" }
//                     }
//                 },{
//                     $sort: { count: -1 }
//                 },{
//                     $limit: 5
//                 }];
//
//             if (req.query.mbId) {
//                 match['artists.mbId']= req.query.mbId;
//             } else if (this.online) {
//                 match['artists.mbId']= { $in: this.artistIds };
//             }
//
//             if (req.query.begin) {
//                 date["$gte"] = new Date(req.query.begin);
//             }
//
//             if (req.query.end) {
//                 date["$lte"] = new Date(req.query.end);
//             }
//
//             if (Object.keys(date).length > 0) {
//                 match.date = date;
//             }
//
//             if (req.query.q) {
//                 match.country = req.query.q;
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             this.mongoDB.collection('song_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//         app.get('/api/streamwatch/country/popularity', function (req, res) {
//             var match = {},
//                 aggregate = [],
//                 date = {};
//
//             if (req.query.mbId) {
//                 match.mbId = req.query.mbId;
//             } else if (this.online) {
//                 match.mbId = { $in: this.artistIds };
//             }
//
//             if (!match.mbId || this.online) {
//                 aggregate.push({
//                     $group: {
//                         _id: "$date",
//                         date: { $first: "$date" },
//                         count: { $sum: "$count" }
//                     }
//                 });
//             }
//
//             if (req.query.begin) {
//                 date["$gte"] = new Date(req.query.begin);
//             }
//
//             if (req.query.end) {
//                 date["$lte"] = new Date(req.query.end);
//             }
//
//             if (Object.keys(date).length > 0) {
//                 match.date = date;
//             }
//
//             if (req.query.q) {
//                 match.country = req.query.q;
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
        app.get('/api/mentions/country', function (req, res) {
            
            this.conn.createStatement(function(err, statement) {
                if (err) res.send(err);
                
                statement.setFetchSize(10, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        var query = 'SELECT mentions.fipscountrycode as _id, COUNT(*) as count ' +
                        'FROM mentions ' +
                        'GROUP BY mentions.fipscountrycode';
                        
                        statement.executeQuery(query,
                            function(err, resultset) {
                                if (err) {
                                    callback(err)
                                } else {
                                    resultset.toObjArray(function(err, results) {
                                        res.json(results);
                                    });
                                }
                            }
                        );
                    }
                });
            });
            
            // var match = {},
            //     aggregate = [{
            //         $group: { _id: "$country", count: { $sum: "$count" }, population: { $first: "$population" }}
            //     }];
            //
            // if (req.query.mbId) {
            //     match.mbId = req.query.mbId;
            // } else if (this.online) {
            //     match.mbId = { $in: this.artistIds };
            // }
            //
            // if (Object.keys(match).length > 0) {
            //     aggregate.unshift({
            //         $match: match
            //     });
            // }
            //
            // this.mongoDB.collection('artist_stats_geo', function(err, collection) {
            //     if(err) res.send(err);
            //
            //     collection.aggregate(aggregate).toArray(function(err, docs) {
            //         if(err) res.send(err);
            //
            //         res.json(docs);
            //     });
            // }.bind(this));
        }.bind(this));
//
//         app.get('/api/streamwatch/artist/monthly', function (req, res) {
//             var match = {},
//                 aggregate = [{
//                     $group: {
//                         _id: "$country",
//                         count: { $sum: "$count" }
//                     }
//                 }],
//                 date = {};
//
//             if (req.query.mbId) {
//                 match.mbId = req.query.mbId;
//             } else if (this.online) {
//                 match.mbId = { $in: this.artistIds };
//             }
//
//             /*if (!match.mbId || this.online) {
//                 aggregate.push({
//                     $group: {
//                         _id: "$country",
//                         count: { $sum: "$count" }
//                     }
//                 });
//             }*/
//
//             if (req.query.begin) {
//                 date["$gte"] = new Date(req.query.begin);
//             }
//
//             if (req.query.end) {
//                 date["$lte"] = new Date(req.query.end);
//             }
//
//             if (Object.keys(date).length > 0) {
//                 match.date = date;
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//         app.get('/api/streamwatch/artist/monthly/dates', function (req, res) {
//             var match = {},
//                 aggregate = [];
//
//             if (req.query.mbId) {
//                 match.mbId = req.query.mbId;
//             } else if (this.online) {
//                 match.mbId = { $in: this.artistIds };
//             }
//
//             if (!match.mbId || this.online) {
//                 aggregate.push({
//                     $group: {
//                         _id: null,
//                         min: { $min: "$date" },
//                         max: { $max: "$date" }
//                     }
//                 });
//             }
//
//             if (req.query.country) {
//                 match.country = req.query.country;
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//         app.get('/api/streamwatch/song/monthly', function (req, res) {
//             var match = {},
//                 aggregate = [{
//                     $group: {
//                         _id: "$country",
//                         count: { $sum: "$count" }
//                     }
//                 }],
//                 date = {};
//
//             if (req.query.mbId) {
//                 match['artists.mbId'] = req.query.mbId;
//             } else if (this.online) {
//                 match['artists.mbId'] = { $in: this.artistIds };
//             }
//
//             if (req.query.song) {
//                 match.song = new RegExp(req.query.song, 'i');
//             }
//
//             if (req.query.begin) {
//                 date["$gte"] = new Date(req.query.begin);
//             }
//
//             if (req.query.end) {
//                 date["$lte"] = new Date(req.query.end);
//             }
//
//             if (Object.keys(date).length > 0) {
//                 match.date = date;
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             this.mongoDB.collection('song_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//         // app.get('/api/streamwatch/song/country', function (req, res) {
// //             var match = {},
// //                 aggregate = [{
// //                     $group: { _id: "$country", count: { $sum: "$count" }, population: { $first: "$population" }}
// //                 }];
// //
// //             if (this.online) {
// //                 match['artists.mbId'] = { $in: this.artistIds };
// //             }
// //
// //             if (req.query.song) {
// //                 match.song = new RegExp(req.query.song, 'i');
// //             }
// //
// //             if (Object.keys(match).length > 0) {
// //                 aggregate.unshift({
// //                     $match: match
// //                 });
// //             }
// //
// //             this.mongoDB.collection('song_stats_geo', function(err, collection) {
// //                 collection.aggregate(aggregate).toArray(function(err, docs) {
// //                     if(err) res.send(err);
// //
// //                     res.json(docs);
// //                 });
// //             }.bind(this));
// //         }.bind(this));
//
//         app.get('/api/streamwatch/artist', function (req, res) {
//             var query = {};
//
//             if (req.query.q) query['lastfm_info.artist.name'] = new RegExp(req.query.q, 'i');
//
//             if (this.online) {
//                 query.mbId = { $in: this.artistIds };
//             }
//
//             this.mongoDB.collection('artist_info', function(err, collection) {
//                 collection.find(query).limit(20).toArray(function(err, docs) {
//                     res.json(docs);
//                 });
//             });
//
//         }.bind(this));
//
//         app.get('/api/streamwatch/song', function (req, res) {
//             var query = {}
//
//             if (req.query.q) query.song = new RegExp(req.query.q, 'i');
//
//             if (this.online) {
//                 query.artistMbId = { $in: this.artistIds };
//             }
//
//             this.mongoDB.collection('song_info', function(err, collection) {
//                 collection.find(query).limit(20).toArray(function(err, docs) {
//                     res.json(docs);
//                 });
//             });
//         }.bind(this));
//
//         app.get('/api/streamwatch/dates/country', function (req, res) {
//             var time = new Date(req.query.timeline),
//                 match = {date: time},
//                 aggregate = [{
//                     $group: { _id : "$country", count: { $sum: "$count" }}
//                 }];
//
//             if (req.query.mbId) {
//                 match.mbId = req.query.mbId;
//             } else if (this.online) {
//                 match.mbId = { $in: this.artistIds };
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//
//             //TODO: SONG
//
//             this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//
//         app.get('/api/streamwatch/tour/country', function (req, res) {
//
//             var continent = req.query.continent.split(","),
//                 match = {},
//                 aggregate = [{
//                     $group: { _id : "$country", count: { $sum: "$count" }}
//                 },
//                 { $sort : { count : -1} }];
//
//             if (continent[0] === '') {
//                 var continents = "AS EU AF NA SA OC AN";
//                 continent = continents.split(" ");
//             }
//
//             match.continent = { $in: continent};
//
//             if (req.query.mbId) {
//                 match.mbId = req.query.mbId;
//             } else if (this.online) {
//                 match.mbId = { $in: this.artistIds };
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//             //TODO: SONG
//             this.mongoDB.collection('artist_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//
//         app.get('/api/streamwatch/tour/song', function (req, res) {
//             var continent = req.query.continent.split(","),
//                 match = {},
//                 aggregate = [
//                 {
//                     $group: { _id : "$song", count: { $sum: "$count" }}
//                 },
//                 { $sort : { count : -1} }];
//
//             if (continent[0] === '') {
//                 var continents = "AS EU AF NA SA OC AN";
//                 continent = continents.split(" ");
//             }
//
//             match.continent = { $in: continent};
//
//             if (req.query.mbId) {
//                 match['artists.mbId'] = req.query.mbId;
//             } else if (this.online) {
//                 match['artists.mbId'] = { $in: this.artistIds };
//             }
//
//             if (Object.keys(match).length > 0) {
//                 aggregate.unshift({
//                     $match: match
//                 });
//             }
//             //TODO: SONG
//
//             this.mongoDB.collection('song_stats_geo_monthly', function(err, collection) {
//                 if(err) res.send(err);
//
//                 collection.aggregate(aggregate).limit(5).toArray(function(err, docs) {
//                     if(err) res.send(err);
//
//                     res.json(docs);
//                 });
//             }.bind(this));
//         }.bind(this));
//
//         app.get('/api/streamwatch/tour/song/info', function (req, res) {
//             var query = {}
//             var songs = req.query.song.split(",");
//
//             if (req.query.song) query.song = { $in: songs};
//             if (req.query.mbId) query['artists.mbId'] = new RegExp(req.query.mbId, 'i');
//             //console.log(query);
//             this.mongoDB.collection('song_info', function(err, collection) {
//                 collection.find(query).toArray(function(err, docs) {
//                     res.json(docs);
//                 });
//             });
//         }.bind(this));


        app.listen(3000, function () {
            console.log('App listening on port 3000!');
        });
    },
    
    exit: function () {
        process.exit()
    }
}

Server.init();