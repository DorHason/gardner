const express = require('express'),
	  redis = require('redis'),
	  shortid = require('shortid'),
	  router = express.Router(),
	  client = redis.createClient(); // this creates a new client

client.on('connect', ()=>{
	console.log('Redis client connected');
	
	// Landing page (root route)
	router.get("/", (req, res) => res.render("landing_page"));
	
	// show login form
	router.get("/login", (req, res) => res.render("login", {alert: ''}));
	
	// handling login logic (with authentication)
	router.post("/login", (req, res)=> {
		let username = req.body.username;
		let password = req.body.password;
		let remember = req.body.remember ? true: false;
		client.hget('users', username, (err, value) => {
			if (err) {
				console.log("An error has occured: " + err);
			}
			else if (!value || JSON.parse(value)['password'] !== password){
				console.log('Wrong username or password');
				res.render('login', {alert: 'Wrong username or password'});
			}
			else {
				let sid = shortid.generate();
				let user = JSON.parse(value);
				user['sid'] = {id: sid, time: Date.now(), remember: remember};  // save cookie
				client.hset('users', user.username, JSON.stringify(user));
				res.cookie('sid', sid);
				console.log('Successfully logged in: ' + username);
				res.redirect('/users/' + username);
			}
		});
	});
	
	router.get('/register', (req, res)=> res.render('register', {alert: ''}));
	
	router.post('/register', (req, res)=>{
		
		client.hget('users', req.body.username, (err, value) => {
			if (err) {
				console.log("An error has occured: " + err);
			}
			else if (value){ // if username is taken, alert the user
				console.log('username is taken: ' + value);
				res.render('register', {alert: 'Username already taken, please choose different one'});
			}
			else {
				let sid = shortid.generate();
				res.cookie('sid', sid);
				let remember = req.body.remember ? true: false;
				let user = {
					username: req.body.username,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					password: req.body.password,
					projects: {},
					sid: {id: sid, time: Date.now(), remember: remember}
				};
				client.hset('users', req.body.username, JSON.stringify(user));  // store user data
				res.redirect("/users/" + req.body.username);
			}
		});
	});
	
	// if (!req.session.user) {

	// if (username == "admin" && password == "p@ssword") {
	// 		req.session.user = 'admin'
	// 	  next();
	// 	} else {
	// 	  var err = new Error("You are not authenticated");

	// 	  res.setHeader("WWW-Authenticate", "Basic");
	// 	  err.status = 401;
	// 	  next(err);
	// 	}
	// }else{
	// 	  if(req.session.user == 'admin'){
	// 		  next();
	// 	  }else{
	// 		var err = new Error("You are not authenticated");
	// 		err.status = 401;
	// 		next(err);
	// 	  }
	//   }
		// MIDDLEWARE TO CHECK THAT USER IS VALID + CHECK COOKIES
	router.use('/users/:username', (req, res, next) => {
		console.log("got to middleware user & cookies route");
		client.hget("users", req.params.username, (err, value)=>{
			if(err || !value){
				if(err) {
					console.log("error: "+ err);
					res.sendStatus(404);
				}
				else {  // if no such username exists in db, alert the user
					console.log("invalid user: "+ req.params.id);
					res.redirect("invalid url");  // TODO: handle better
				}
			} else {  // user is valid, check if cookies are valid as well
				console.log("checking cookies...");
				let user = JSON.parse(value);
				console.log(user);
				console.log(req.cookie);
				if(!req.cookie || user.sid.id !== req.cookie) {  // if cookie is invalid, redirect to login/register page
					res.redirect('/');
				} else if (!user.sid.remember && Date.now() - user.sid.time > 30 * 1000 * 60){
					res.redirect('/');
				} else {
					console.log("passed middleware user & cookies route");
					next();
				}
			}
		});
	});
	
});

client.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

module.exports = router;