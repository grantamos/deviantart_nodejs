var express = require('express');
var http = require('http');
var request = require('request');
var redis = require('redis');
var routes = require('./routes');

var app = express();
var version = "v1";
var redisClient = redis.createClient();

app.get("*", function(req, res, next){
	req.db = redisClient;

	req.db.get(req.originalUrl, function(err, reply){
		if(reply){
			routes.sendSuccess(res, JSON.parse(reply));
			console.log("Sending cached response for: " + req.originalUrl);
		}
		else{
			next();
		}
	});
});

app.get("/"+version+"/media/browse/", routes.media.browse);
app.get("/"+version+"/media/search/", routes.media.search);
app.get("/"+version+"/media/:id/comments", routes.media.comments);
app.get("/"+version+"/media/:id", routes.media.browse);

app.get("/"+version+"/users/:id", routes.users.getUser);

app.listen(1337);