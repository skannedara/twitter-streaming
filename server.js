//Setup web server and socket
var twitter = require('twitter'), 
    express = require('express'), 
    app = express(), 
    http = require('http'), 
    OAuth = require('OAuth'), 
    server = http.createServer(app), 
    io = require('socket.io').listen(server), 
    morgan   = require('morgan'), 
    bodyParser = require('body-parser'), 
    methodOverride = require('method-override'), 
    sslRootCAs = require('ssl-root-cas/latest'), 
    mongoose = require('mongoose'), 
    database = require('./config/database'); 
mongoose.connect(database.url);   // connect to mongoDB database on modulus.io

var twitterDBModel = require('./models/twitterDBModel');
var trendsDBModel = require('./models/trendsDBModel');
//Setup twitter stream api
var twit = new twitter({
  consumer_key: 'Fb5UiFEq11uXMWiodketTSDGl',
  consumer_secret: 'zFJrdQ5YuYiZnAQdsB3Q1GGVJbtxWTqw1onl3j2BfkCP5PxKD0',
  access_token_key: '140391840-HYmfGT9WAq06I1dNKXz1nzvMAJU6aK4JIHcEDQ1w',
  access_token_secret: 'jKK6dxMmQRcKsNACdBhCGJRUAyIJ39QycJBbNKa19Kv4z'
}),
stream = null;
var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'Fb5UiFEq11uXMWiodketTSDGl',
  'zFJrdQ5YuYiZnAQdsB3Q1GGVJbtxWTqw1onl3j2BfkCP5PxKD0',
  '1.0A',
  null,
  'HMAC-SHA1'
);
//require('events').EventEmitter.prototype._maxListeners = 1000;
//Use the default port (for beanstalk) or default to 10022 locally
server.listen(process.env.PORT || 10022);
console.log("Twitter App listening on port " + (process.env.PORT || 10022));
// routes ======================================================================
app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
require('./app/routes.js')(app);

sslRootCAs.inject()//Setup rotuing for app
app.use(express.static(__dirname + '/public'));

//Create web sockets connection.
io.sockets.on('connection', function (socket) {

  socket.on("start tweets", function() {

    if(stream === null) {
      //Connect to twitter stream passing in filter for entire world.
      twit.stream('statuses/filter', {'locations':'-180,-90,180,90'}, function(stream) {
          stream.setMaxListeners(0);
          stream.on('data', function(data) {
              // Does the JSON result have coordinates
              if (data.coordinates){
                if (data.coordinates !== null){
                  //If so then build up some nice json and send out to web sockets
                  var outputPoint = {"lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1]};

                  socket.broadcast.emit("twitter-stream", outputPoint);

                  //Send out to web sockets channel.
                  socket.emit('twitter-stream', outputPoint);
                }
                else if(data.place){
                  if(data.place.bounding_box === 'Polygon'){
                    // Calculate the center of the bounding box for the tweet
                    var coord, _i, _len;
                    var centerLat = 0;
                    var centerLng = 0;

                    for (_i = 0, _len = coords.length; _i < _len; _i++) {
                      coord = coords[_i];
                      centerLat += coord[0];
                      centerLng += coord[1];
                    }
                    centerLat = centerLat / coords.length;
                    centerLng = centerLng / coords.length;

                    // Build json object and broadcast it
                    var outputPoint = {"lat": centerLat,"lng": centerLng};
                    socket.broadcast.emit("twitter-stream", outputPoint);

                  }
                }
              }
              // Inset data into Mongo DB
              if(data && data.geo && data.user && data.coordinates && data.place && data.lang && data.timestamp_ms){
                twitterDBModel.create({
                  created_at : data.created_at,
                  id_str : data.id_str,
                  text : data.text,
                  source : data.source,
                  user_id_str : data.user.id_str,
                  user_name : data.user.name,
                  user_screen_name : data.user.screen_name,
                  user_followers_count : data.user.followers_count,
                  user_friends_count : data.user.friends_count,
                  user_listed_count : data.user.listed_count,
                  user_favourites_count : data.user.favourites_count,
                  user_statuses_count : data.user.statuses_count,
                  user_created_at : data.user.created_at,
                  geo_type : data.geo.type,
                  geo_coordinates_lat : data.geo.coordinates[0],
                  geo_coordinates_lng : data.geo.coordinates[1],
                  coordinates_type : data.coordinates.type,
                  coordinates_lat : data.coordinates.coordinates[0],
                  coordinates_lng : data.coordinates.coordinates[1],
                  place_id : data.place.id,
                  place_url : data.place.url,
                  place_type : data.place.time,
                  place_name : data.place.name,
                  place_full_name : data.place.full_name,
                  place_country_cd : data.place.country_code,
                  place_country : data.place.country,
                  lang : data.lang,
                  timestamp_ms : data.timestamp_ms,
                  done : false
                }, function(err, twitterData) {
                  if (err)
                    console.log(err);
                  else{
                    //console.log('Twitter data inserted to table');
                    //console.log(twitterData);
                  }

                });
              }

              stream.on('limit', function(limitMessage) {
                return console.log(limitMessage);
              });

              stream.on('warning', function(warning) {
                return console.log(warning);
              });

              stream.on('disconnect', function(disconnectMessage) {
                return console.log(disconnectMessage);
              });
          });
      });

    }
  });

  topTrends(oauth, socket, trendsDBModel);
  setInterval(function(){
    topTrends(oauth, socket, trendsDBModel);
  },900000);

  // Emits signal to the client telling them that the
  // they are connected and can start receiving Tweets
  socket.emit("connected");
});

function topTrends(oauth, socket, trendsDBModel){
      oauth.get(
        //'https://api.twitter.com/1.1/search/tweets.json?q=%23caesars&since_id=519891262279647232&max_id=523179974019514368&result_type=popular&count=10',
        'https://api.twitter.com/1.1/trends/place.json?id=2436704',
        '140391840-HYmfGT9WAq06I1dNKXz1nzvMAJU6aK4JIHcEDQ1w',
        'jKK6dxMmQRcKsNACdBhCGJRUAyIJ39QycJBbNKa19Kv4z',
        function (error, data, response){
          if (error) console.error(error);
          console.log("Top trends for Caesars are received");

          socket.broadcast.emit("caesars-trending", data);
          socket.emit('caesars-trending', data);//Send out to web sockets channel.
          //console.log(data);

      });

      oauth.get(
        'https://api.twitter.com/1.1/trends/place.json?id=1',
        '140391840-HYmfGT9WAq06I1dNKXz1nzvMAJU6aK4JIHcEDQ1w',
        'jKK6dxMmQRcKsNACdBhCGJRUAyIJ39QycJBbNKa19Kv4z',
        function (error, data, response){
          if (error) console.error(error);
          console.log("Top trends are received");

          socket.broadcast.emit("twitter-trending", data);
          socket.emit('twitter-trending', data);//Send out to web sockets channel.
          //Inset data into Mongo DB
          var json = JSON.parse(data);
          var insertData = 0;
          if(json != null && json[0] != null){
            if(json[0].trends){
              for(var i=0; i<(json[0].trends).length; i++){
                trendsDBModel.create({
                  trends_as_of : json[0].as_of,
                  trends_created_at : json[0].created_at,
                  locations_name : json[0].locations[0].name,
                  woeid : json[0].locations[0].woeid,
                  trends_name : json[0].trends[i].name,
                  trends_query : json[0].trends[i].query,
                  trends_url : json[0].trends[i].url,
                  trends_promoted_content : json[0].trends[i].promoted_content,
                  done : false
                }, function(err, trendsData) {
                  if (err)
                    console.log(err);
                  else
                    insertData = insertData + 1;
                });
              }
            }
          }
          if(insertData > 0){
            console.log('Top Trends data inserted to table');
          }

      });
}
