var express = require('express');
var http = require('http');
var request = require('request');
var redis = require('redis');
var routes = require('./routes');

var app = express();
var version = "v1";

app.get("/"+version+"/media/browse/", routes.media.browse);
app.get("/"+version+"/media/search/", routes.media.search);
app.get("/"+version+"/media/:id/comments", routes.media.comments);
app.get("/"+version+"/media/:id", routes.media.browse);

app.get("/"+version+"/users/:id", routes.users.getUser);

app.listen(1337);