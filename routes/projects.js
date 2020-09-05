const express = require('express'),
	  redis = require('redis'),
	  stopwatch = require('statman-stopwatch'),
	  router = express.Router({mergeParams: true}),
	  client = redis.createClient(); // this creates a new client

client.on('connect', ()=>{
	console.log('Redis client connected');
	
	// MIDDLEWARE TO CHECK THAT USER IS VALID
	router.use('/*', (req, res, next) => {
		console.log("got to middleware user route");
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
				console.log("passed middleware user route");
				next();
			}
		});
	});
	
	// NEW PROJECT - POST
	router.post('/', (req, res) => {
		console.log("got to post project route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			if (user.projects.hasOwnProperty(req.body.title)) {  // project name already exists
				res.render('projects/new_wrong', {user: user});
			} else {
				user.projects[req.body.title] = {'id': req.body.title, 'running': false, 'sessions': {'id': 0}};
				client.hset("users", user.username, JSON.stringify(user));
				res.redirect('/users/' + user.username);
			}
		});
	})
	
	// NEW PROJECT
	router.get('/new', (req, res) => {
		console.log("got to new project route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			console.log(user);
			res.render('projects/new', {user: user});
		});
	});
	
	// MIDDLEWARE TO CHECK IF PROJECT EXISTS
	router.use('/:project_id', (req, res, next)=>{
		console.log('got to middleware project route');
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			if (!user.projects.hasOwnProperty(req.params.project_id)) { // if no such project exists in db, alert the user  
					console.log("invalid project: "+ req.params.project_id);
					res.send("invalid url");
			} else {
				console.log('passed middleware project route');
				next();
			}
		});
	});
	
	// SHOW PROJECT
	router.get('/:project_id', (req, res)=>{
		console.log("got to show project route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			res.render('projects/show', {projects: user.projects});
		});
	});
	
	// EDIT PORJECT
	router.get('/:project_id/edit', (req, res)=>{
		console.log("got to edit project route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			res.render('projects/edit', {user: user, project: user.projects[req.params.project_id]});
		});
	});
	
	// UPDATE PROJECT
	router.put('/:project_id', (req, res)=>{
		console.log("got to update project route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			let old_project_id = req.params.project_id;
			let new_project_id = req.body.title;
			if (new_project_id === old_project_id) {  // if nothing has changed, do nothing
				res.redirect('/users/' + req.params.username);
			} else if (user.projects.hasOwnProperty(new_project_id)) {	// if new project id already exists, alert the user
				res.render('projects/edit_wrong', {user: user, project: user.projects[req.params.project_id]});
			} else {
				user.projects[new_project_id] = user.projects[old_project_id];
				user.projects[new_project_id].id = new_project_id;
				delete user.projects[old_project_id];
				client.hset("users", user.username, JSON.stringify(user));
				res.redirect('/users/' + req.params.username);
			}
		});
	});
	
	// DELETE PROJECT
	router.delete('/:project_id', (req, res)=>{
		console.log("got to delete project route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			let key = req.params.project_id;
			console.log(key);
			delete user.projects[key];
			client.hset("users", user.username, JSON.stringify(user));
			res.redirect('/users/' + req.params.username);
		});
	});
	
	// START SESSION
	router.get('/:project_id/start', (req, res)=>{
		console.log("got to start session route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			let projectId = req.params.project_id;
			if(user.projects[projectId].running) {
				res.sendStatus(200);
			} else {
				user.projects[projectId].running = true;  // change project state to running
				user.projects[projectId].sessions.id++;  // increment number of sessions
				let sessionId = user.projects[projectId].sessions.id;
				const Stopwatch = require('statman-stopwatch');
    			const sw = new Stopwatch(true);  // create and start a new stopwatch
				user.projects[projectId].sessions[sessionId] = sw;  // store stopwatch as new session
				console.log(user.projects[projectId]);
				res.sendStatus(200);
			}
			// client.hset("users", user.username, JSON.stringify(user));
			// res.redirect('/users/' + req.params.username);
		});
	});
	
	// STOP SESSION
	router.get('/:project_id/stop', (req, res)=>{
		console.log("got to stop session route");
		client.hget("users", req.params.username, (err, value)=>{
			let user = JSON.parse(value);
			let projectId = req.params.project_id;
			if(!user.projects[projectId].running) {
				res.sendStatus(200);
			} else {
				user.projects[projectId].running = false;  // change project state to running
				let sessionId = user.projects[projectId].sessions.id;
				let sessionTime = user.projects[projectId].sessions[session_id].stop();
				user.projects[projectId].sessions[sessionId]['sessionTime'] = sessionTime;
				console.log(user.projects[projectId]);
				res.sendStatus(200);
			}
			// client.hset("users", user.username, JSON.stringify(user));
			// res.redirect('/users/' + req.params.username);
		});
	});
});

client.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

module.exports = router;