var dbconn = require('./db_connection.js');
var objectId = require('mongodb').ObjectId;


module.exports.getPasswords = function (req, res) {
    var db = dbconn.get(); //node module in dbconnection is a global variable. So when a database connection is open in app.js, that open connection can be used here. Also, putting the database connection in this module makes sure the database connection is open before running any queries
    var collection = db.collection('passwords');

    collection.find().toArray(function (err, data) {
        res.json(data);

    });

};


module.exports.storePassword = function (req, res) {

    var db = dbconn.get();
    var collection = db.collection('passwords');
    var passwordEntry = {};
    if (req.query) {
        passwordEntry['name'] = req.query.name;
        passwordEntry['username'] = req.query.username;
        passwordEntry['password'] = req.query.password;
        passwordEntry['hint'] = req.query.hint;
        passwordEntry['hintAnswer'] = req.query.templateType;
        collection.update({name: req.query.name}, passwordEntry, {upsert: true}, function (err, response) {
            res.json(response.ops);

        });
//        collection.insertOne(newContract, function (err, response) {
//            res.json(response.ops);
//
//        });
    } else {
        console.log("Data missing from query");
        res.status(400).json({
            message: "Required data missing from query"
        });
    }
};

