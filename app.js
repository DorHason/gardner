// express
const express = require('express');
const app = express();
const port = 3000;

const redis = require('redis');
const client = redis.createClient(); // this creates a new client

client.on('connect', function() {
	console.log('Redis client connected');
});

client.on('error', function (err) {
	console.log('Something went wrong ' + err);
});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Server has started on port ${port}`)
});