const express = require('express'),
	  router = express.Router(),
	  redis = require('redis'),
	  client = redis.createClient(); // this creates a new client

let id = 0;

client.on('connect', ()=>{
	console.log('Redis client connected');
	
	router.get('/register', (req, res)=> res.render('register'));
	
	router.post('/register', (req, res)=>{
		let user = {
			userid: ++id,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: req.body.password
		};
		client.hset('users', id, JSON.stringify(user));
		res.redirect("/users/" + id);
	});
});

client.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

module.exports = router;