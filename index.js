var config = require('./config'),
    express = require('express'),
    echonest = require('echonestjs'),
    echonestMiddleware = require('echonest-middleware'),
    mongoClient = require('mongodb').MongoClient,
    app = express();

var Server = {
    db: null,
    
    init: function () {
        echonest.init(config.ECHONEST_API_KEY);
        
        mongoClient.connect(config.MONGODB_URL, function(err, db) {
            if (err) {
                console.log('Error connecting to MongoDB', err);
                exit();
            } else {
                console.log('Connected to MongoDB');

                db.authenticate(config.MONGODB_USERNAME, config.MONGODB_PASSWORD, function(err, result) {
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
        
        app.get('/api', function (req, res) {
            mongoClient.
            res.send('API works!');
        }.bind(this));
        
        app.get('/api/echonest', echonestMiddleware(config.ECHONEST_API_KEY))
        
        app.get('/api/streamwatch/:method', function (req, res) {
            var query = {};
            
            if (req.query.mbId) query.mbId = req.query.mbId;

            this.db.collection(req.params.method, function(err, collection) {
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
        this.db.close();
        
        process.exit()
    }
}

Server.init();