const express = require('express'),
	  redis = require('redis'),
	  router = express.Router(),
	  client = redis.createClient(); // this creates a new client

client.on('connect', ()=>{
	console.log('Redis client connected');
	
	// Landing page (root route)
	router.get("/", (req, res) => res.render("landing_page"));
	
	// show login form
	router.get("/login", (req, res) => res.render("login"));
	
	// handling login logic (with authentication)
	router.post("/login", (req, res)=> {
		let username = req.body.username;
		let password = req.body.password;
		client.hget('users', username, (err, value) => {
			if (err) {
				console.log("An error has occured: " + err);
			}
			else if (!value || JSON.parse(value)['password'] !== password){
				console.log('wrong password');
				res.render('login_wrong');
			}
			else {
				console.log('Successfully logged in: ' + username);
				res.redirect('/users/' + username);
			}
		});
	});
	
	router.get('/register', (req, res)=> res.render('register'));
	
	router.post('/register', (req, res)=>{
		
		client.hget('users', req.body.username, (err, value) => {
			if (err) {
				console.log("An error has occured: " + err);
			}
			else if (value){ // if username is taken, alert the user
				console.log('username is taken: ' + value);
				res.render('register_username');
			}
			else {		
				let user = {
					username: req.body.username,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					password: req.body.password,
					projects: []
				};
				client.hset('users', req.body.username, JSON.stringify(user));  // store user data
				res.redirect("/users/" + req.body.username);
			}
		});
	});
});

client.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

module.exports = router;