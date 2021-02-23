var MongoClient = require('mongodb').MongoClient;
var _connection = null;
var dburl = 'mongodb://localhost:27017/data';

var open = function(){
    MongoClient.connect(dburl, function(err, db){
        if(err){
            console.log('Connection failed');
            return;
        }
        _connection = db;
        console.log('DB connection open', db);
        
        
    });
    
};

var get = function(){
    
    return _connection;
};

module.exports = {
  open: open,
  get: get
    
};