// express
const express = require('express'),
	  app = express(),
	  port = 3000,
	  bodyParser = require("body-parser");

// const shortid = require('shortid');
// const cookieParser = require('cookie-parser');

// require routes
const indexRoutes = require('./routes/index')

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json())

app.set("view engine", "ejs");
// use routes
app.use(indexRoutes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server has started on port ${port}`);
});