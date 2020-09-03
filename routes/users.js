const express = require('express'),
	  redis = require('redis'),
	  router = express.Router(),
	  client = redis.createClient(); // this creates a new client

client.on('connect', ()=>{
	console.log('Redis client connected');
	
	router.get('/:username', (req, res)=>{
		client.hget("users", req.params.username, (err, value)=>{
			if(err || !value){
				if(err) {
					console.log("error: "+ err);
					res.sendStatus(404);
				}
				else {  // if no such username exists in db, alert the user
					console.log("invalid user: "+ req.params.username);
					res.send("invalid url");
				}
			} else {  // user is valid
				console.log(value);
				res.render('users/show', {user: JSON.parse(value)})
			}
		});
	});
});

client.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

module.exports = router;