var posRuleModel = require('../models/twitterDBModel');

module.exports = function(app) {

	// get all twitterData
	app.get('/api/twitterData/:page_id', function(req, res) {
		var pageNum = req.params.page_id;
		// use mongoose to get all twitterData in the database
		var query = posRuleModel.find({});
		query.skip(pageNum * 10);	// Starting number
		query.limit(10);			// Limit per page
		console.log(query);
		query.exec(function(err, twitterData) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			//console.log(twitterData);
			res.json(twitterData); // return all rules in JSON format
			console.log("Twitter Data from Table");
		});
	});

};