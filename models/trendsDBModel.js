var mongoose = require('mongoose');
// Setup Mongo DB to store twitter trends on time
module.exports = mongoose.model('twitterTopTrends', {
  trends_as_of : {type : String, default: ''},
  trends_created_at : {type : String, default: ''},
  locations_name : {type : String, default: ''},
  woeid : {type : Number, default: ''},
  trends_name : {type : String, default: ''},
  trends_query : {type : String, default: ''},
  trends_url : {type : String, default: ''},
  trends_promoted_content : {type : String, default: ''}
});