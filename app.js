// express
const express = require('express'),
	  app = express(),
	  redis = require('redis'),
	  port = 3000,
	  bodyParser = require("body-parser"),
	  session = require('express-session'),
	  redisStore = require('connect-redis')(session),
	  methodOverride = require("method-override");

const redisClient = redis.createClient(); // this creates a new client

redisClient.on('error', (err)=>{
	console.log('Something went wrong ' + err);
});

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

// redisClient.on('connect', ()=>{
// 	app.use(session({
// 	  secret: 'M6weLE<X}[ZC.|G?.evp[wLgsR"K.J`+NfUlvH$Z-2=`G}*L6BFzJav=<a1Q3f~',  // 504-bit WPA Key
// 	  name: 'bisi',
// 	  resave: false,
// 	  saveUninitialized: true,
// 	  cookie: { secure: false },
// 	  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
// 	}));
// });

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