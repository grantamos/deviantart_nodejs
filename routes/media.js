var request = require('request');
var cheerio = require('cheerio');
var routes = require('./index');

var timeToOrder = {
	"8HRS": "24",
	"ALL": "9",
	"24HRS": "11",
	"3DAYS": "13",
	"WEEK": "14",
	"MONTH": "15",
	"NEW": "5",
	"HOT": "67108864",
	"undiscovered": "134217728"
};

var getBrowseUrl = function(time, offset, length, category, query){
	var baseUrl = 'http://www.deviantart.com/global/difi/';
	var apiClass = 'PortalCore';
	var method = 'get_result_thumbs';
	var args = [
		"browse",
		{
			"order":time,
			"offset":offset,
			"length":length,
			"is_mobile":"1"
		}
	];

	if(category != undefined)
		args[1]["category_path"] = category.replace(/|/g,"/");
	if(query != undefined)
		args[1]["freeform_user_input"] = query;

	return buildUrl(baseUrl, apiClass, method, args);
};

var buildUrl = function(baseUrl, apiClass, method, args){
	var url = baseUrl+'?c[]="'+apiClass+'","'+method+'",'+JSON.stringify(args)+'&t=json';
	console.log(url);
	return url;
};

var extractBrowseData = function(json){
	var DiFi = json.DiFi;
	if(DiFi.status == "FAIL")
		return json.DiFi.response;

	var response = json.DiFi.response.calls[0].response;
	if(response.status == "FAIL")
		return response.content;

	var resources = response.content.resources;		

	var data = [];

	for (var i = 0; i < resources.length; i++) {
		var html = resources[i][2];
		var $ = cheerio.load(html);

		var image = {};

		image.userIcon = $('div').attr('usericon');
		image.username = $('div').attr('username');
		image.userSymbol = $('div').attr('symbol');
		image.userid = $('div').attr('userid');
		image.category = $('div').attr('category');
		image.title = $('a.t').text().trim();
		image.posted = $('span.age').html();

		var imageData = $('a.thumb');
		var thumbData = imageData.find('img');

		image.thumb = {
			'url':thumbData.attr('src'),
			'width':thumbData.attr('width'),
			'height':thumbData.attr('height')
		};
		image.image = {
			'url':imageData.attr('data-super-img'),
			'width':imageData.attr('data-super-width'),
			'height':imageData.attr('data-super-height')
		};
		image.superImage = {
			'url':imageData.attr('data-super-full-img'),
			'width':imageData.attr('data-super-full-width'),
			'height':imageData.attr('data-super-full-height')
		};
		image.link = thumbData.attr('href');

		data.push(image);
	};

	return data;
};

exports.browse = function(req, res){
	var category = req.query.category;
	var offset = req.query.offset || 0;
	var length = 24;
	var time = req.query.time || "8HRS";
	time = timeToOrder[time];

	if(time == undefined){
		res.send({"error": "Invalid time: "+time});
		return;
	}

	request(getBrowseUrl(time, offset, length, category), function(error, response, body){
		if(!error && response.statusCode == 200){			
			var json = JSON.parse(body);
			json = extractBrowseData(json);
			routes.sendResponse(req, res, json);
		}
		else{
			res.writeHead(response.statusCode, {'Content-Type': 'text/plain'});
			res.send("Server side error: " + error);
		}
	});
};

exports.search = function(req, res){
	var time = req.query.time || "8hours";
	var category = req.query.category;
	var offset = req.query.offset || 0;
	var length = 24;
	var query = req.query.query;

	if(query == null || query == undefined){
		res.send({"error": "Invalid query parameter: "+query});
		return;
	}

	request(getBrowseUrl(time, offset, length, category, query), function(error, response, body){
		if(!error && response.statusCode == 200){
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			
			var json = JSON.parse(body);

			res.send(extractBrowseData(json));
			return;
		}
		else{
			res.writeHead(response.statusCode, {'Content-Type': 'text/plain'});
			res.send("Server side error: " + error);
			return;
		}
	});
};

exports.comments = function(req, res){

};