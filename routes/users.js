const express = require('express'),
	  redis = require('redis'),
	  router = express.Router(),
	  client = redis.createClient(); // this creates a new client

client.on('connect', ()=>{
	console.log('Redis client connected');
	
	router.get('/:id', (req, res)=>{
		client.hget("users", req.params.id, (err, value)=>{
			if(err || !value){
				if(err) {
					console.log("error: "+ err);
					res.sendStatus(404);
				}  // if no such username exists in db, alert the user
				else {  // 
					console.log("invalid user: "+ req.params.id);
					res.send("invalid url");
				}
			} else {
				console.log(value);
				res.send(value);
			}
		});
	});
});

client.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

module.exports = router;