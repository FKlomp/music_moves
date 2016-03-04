var ECHONEST_API_KEY = 'ECHONEST_API_KEY',
    MONGODB_URL = 'MONGODB_URL',
    MONGODB_USERNAME = 'MONGODB_USERNAME',
    MONGODB_PASSWORD = 'MONGODB_PASSWORD'

var express = require('express'),
    echonest = require('echonestjs'),
    echonestMiddleware = require('echonest-middleware'),
    mongoClient = require('mongodb').MongoClient,
    app = express();

var Server = {
    db: null,
    
    init: function () {
        echonest.init(ECHONEST_API_KEY);
        
        mongoClient.connect(MONGODB_URL, function(err, db) {
            if (err) {
                console.log('Error connecting to MongoDB', err);
                exit();
            } else {
                console.log('Connected to MongoDB');

                db.authenticate(MONGODB_USERNAME, MONGODB_PASSWORD, function(err, result) {
                    if (err) {
                        console.log('Error performing MongoDB authentication', err);
                        exit();
                    } else {
                        console.log('Successfully authenticated MongoDB');
                        
                        this.db = db;
                        this.startServer();
                    }
                }.bind(this));
            }
        }.bind(this));
    },
    
    startServer: function () {
        app.use(express.static('public'));
        
        app.use('/api', function (req, res) {
            res.send('API works!');
        }.bind(this));
        
        app.use('/api/echonest', echonestMiddleware(ECHONEST_API_KEY))
        
        app.get('/api/streamwatch/artist_info', function (req, res) {
            var mbId = req.query.mbId;
            
            this.db.collection('artist_info', function(err, collection) {
                collection.find({ mbId: mbId }).toArray(function(err, docs) {
                    res.json(docs);
                });
            });
            
        }.bind(this));
        
        app.listen(3000, function () {
            console.log('App listening on port 3000!');
        });
    },
    
    exit: function () {
        this.db.close();
        
        process.exit()
    }
}

Server.init();