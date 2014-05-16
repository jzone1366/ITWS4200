var express = require('express'),
	io = require('socket.io'),
	http = require('http'),
	app = express(),
	server = http.createServer(app),
	port = 8080,
	bodyParser = require('body-parser');

//Twitter Connection
var twitter = require('ntwitter');
var twit = new twitter({
	consumer_key: '5UMbMiZmyfmZIv4w4wIvA',
	consumer_secret: '4XbLRKae0JnngpHyvgXm1K0dnmHYjKGwsZhHrfychy0',
	access_token_key: '110624472-7wxnUD6uIdDYnwLAEIucjtVe1jn6oMWgwd4Oytmp',
	access_token_secret: 'wfgF941yxA0xt2eg6QPUPpI2p5KBCJY3j9OOhir3gsFHF'
});

//MongoDB Connection
var MongoClient = require('mongodb').MongoClient;
var tweets;
MongoClient.connect('mongodb://127.0.0.1:27017/quiz2DB', function(err, db){
	if(err) console.log(err);
	else {
		console.log('MongoDB Connection Successful');
		db.createCollection('tweets', {strict: true}, function(err, collection){
			if(err){
				db.collection('tweets').drop(function(err, reply){
					if(err) console.log(err);
					else if(reply = true){
						tweets = db.collection('tweets');
					}
				});
			}
			else {
				tweets = collection;
			}
		});
	}
});

server.listen(port, function(){
	console.log("Listening on " + port);
});

//SOCKET.IO Logic (Connection)
io = io.listen(server);
io.sockets.on('connection', function(socket){
	console.log('Socket Connected');
	
	var i = 0, numTweets = 100;
	twit.stream('statuses/sample', function(stream){
		stream.on('error', function(error, code){
			console.log("error: " + error + ":" + code);
		});
		stream.on('end', function(response){
			console.log('Stream Ended');
		});
		stream.on('destroy', function(response){
			console.log("Stream Destroyed");
		});
		stream.on('data', function(data){
			console.log(i);
			if(i < numTweets){
				i++;
				socket.emit('progress', {num : i})
				tweets.insert(data, function(err){
					if(err){
						console.dir(error);
					}
				});
			} else if(i == numTweets){
				i++;
				console.log("Finished");
				stream.destroy();
			}
		});
	});
});

//ROUTES
app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/index.html', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.use('/resources', express.static(__dirname + '/resources'));
app.use(bodyParser());

app.post('/formSubmit', function(req, res){
	console.log("Successful Post");
	handle = req.body.twitHandle;
	image = req.body.checkImage;
	console.log(handle);
	console.log(image);
	db.tweets.find({"user.screen_name" : handle}, function(data, err){
		if(err) console.log(err);
		res.json(data);
	});
});