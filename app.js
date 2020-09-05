// express
const express = require('express'),
	  app = express(),
	  port = 3000,
	  bodyParser = require("body-parser"),
	  methodOverride = require("method-override");

// const shortid = require('shortid');
// const cookieParser = require('cookie-parser');

// require routes
const indexRoutes = require('./routes/index'),
	  usersRoutes = require('./routes/users'),
	  projectsRoutes = require('./routes/projects');
	  // sessionsRoutes = require('./routes/sessions');

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.set("view engine", "ejs");

// app.use(express.static(__dirname + "/node_modules"));

app.use(express.static(__dirname + '/public'));

app.use(methodOverride("_method"));

// use routes
app.use(indexRoutes);
app.use("/users", usersRoutes);
app.use("/users/:username/projects", projectsRoutes);
// app.use("/users/:username/projects/:project_id/sessions", sessionsRoutes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server has started on port ${port}`);
});