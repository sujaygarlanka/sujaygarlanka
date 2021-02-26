var express = require('express');
var app = express();
var url = require('url');
var https = require('https');
var http = require('http');
var database = require('./database/functions');
//require('./database/db_connection.js').open();
var root = __dirname;

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(root + "/index.html");
})

app.get('/JSLibraries/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1];
    res.sendFile(root + "/JSLibraries/" + req_url);
})

app.get('/css/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1];
    res.sendFile(root + "/css/" + req_url);
})
app.get('/node_modules/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.replace("/node_modules/", "");
    res.sendFile(root + "/node_modules/" + req_url);
})

app.get('/js/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1];
    res.sendFile(root + "/js/" + req_url);
})

app.get('/images/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1];
    res.sendFile(root + "/images/" + req_url);
})

app.get('/images/icons/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1];
    res.sendFile(root + "/images/icons/" + req_url);
})

app.get('/pages/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1];
    res.sendFile(root + "/pages/" + req_url);
})

app.get('/fonts/font-awesome/css/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1];
    res.sendFile(root + "/fonts/font-awesome/css/" + req_url);
})

app.get('/fonts/font-awesome/fonts/*', function (req, res) {
    // Prepare output in JSON format
    var req_url = req.url.split('/');
    req_url = req_url[req_url.length - 1].split('?')[0];
    res.sendFile(root + "/fonts/font-awesome/fonts/" + req_url);
})

app.get('/C_Worker/getPasswords', function (req, res) {
    console.log('getting passwords');
    database.getPasswords(req, res);
})

app.get('/C_Worker/storePassword', function (req, res) {
    console.log('storing password');
    database.storePassword(req, res);
})


var server = app.listen(8000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)

})
