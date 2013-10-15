var request = require('request');
var cheerio = require('cheerio');

exports.getUser = function(req, res){
	var userid = req.params.id;

	if(userid == null || userid == undefined){
		res.send({"error": "Invalid user id: "+userid});
		return;
	}

	request(getUserUrl(userid), function(error, response, body){
		if(!error && response.statusCode == 200){
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			
			res.send({});
			return;
		}
		else{
			res.writeHead(response.statusCode, {'Content-Type': 'text/plain'});
			res.send("Server side error: " + error);
			return;
		}
	});
};