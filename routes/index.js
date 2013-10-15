module.exports.media = require('./media');
module.exports.users = require('./users');

module.exports.sendResponse = function(req, res, json){
	if(req != undefined){
		console.log("Sending new response for: " + req.originalUrl);
		req.db.setex(req.originalUrl, 30, JSON.stringify(json));
	}

	module.exports.sendSuccess(res, json);
};

module.exports.sendSuccess = function(res, json){
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.send(json);
};