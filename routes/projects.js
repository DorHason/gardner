const express = require('express'),
	  redis = require('redis'),
	  router = express.Router({mergeParams: true}),
	  client = redis.createClient(); // this creates a new client

client.on('connect', ()=>{
	console.log('Redis client connected');
	
	// MIDDLEWARE TO CHECK THAT USER IS VALID
	router.use('/*', (req, res, next) => {
		client.hget("users", req.params.username, (err, value)=>{
			if(err || !value){
				if(err) {
					console.log("error: "+ err);
					res.sendStatus(404);
				}
				else {  // if no such username exists in db, alert the user
					console.log("invalid user: "+ req.params.id);
					res.send("invalid url");
				}
			} else {  // user is valid
				next();
			}
		});
	});
	
	// NEW PROJECT - POST
	router.post('/', (req, res) => {
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			if (user.projects.hasOwnProperty(req.body.title)) {  // project name already exists
				res.render('projects/new_wrong', {user: user});
			} else {
				user.projects[req.body.title] = {'id': req.body.title, 'sessions': {}};
				client.hset("users", user.username, JSON.stringify(user));
				res.redirect('/users/' + user.username);
			}
		});
	})
	
	// NEW PROJECT
	router.get('/new', (req, res) => {
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			console.log(user);
			res.render('projects/new', {user: user});
		});
	});
	
	// MIDDLEWARE TO CHECK IF PROJECT EXISTS
	router.use('/:project_id', (req, res, next)=>{
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			if (!user.projects.hasOwnProperty(req.params.project_id)) { // if no such project exists in db, alert the user  
					console.log("invalid project: "+ req.params.project_id);
					res.send("invalid url");
			} else {
				next();
			}
		});
	});
	
	// SHOW PROJECT
	router.get('/:project_id', (req, res)=>{
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			console.log(user);
			res.render('projects/show', {projects: user.projects});
		});
	});
	
	// EDIT PORJECT
	router.get('/:project_id/edit', (req, res)=>{
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			console.log(user);
			res.render('projects/edit', {user: user, project: user.projects[req.params.project_id]});
		});
	});
	
	// UPDATE PROJECT
	router.put('/:project_id', (req, res)=>{
		console.log('here');
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			console.log(user);
			res.redirect('back');
		});
	});
	
	// DELETE PROJECT
	router.delete('/:project_id', (req, res)=>{
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			console.log(user);
			let key = req.params.project_id;
			delete user.projects.key;
			client.hset("users", user.username, JSON.stringify(user));
			res.redirect('back');
		});
	});
});

client.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

module.exports = router;