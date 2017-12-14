const express    = require('express');
const bodyParser = require('body-parser');
const redis      = require('redis');
const io         = require('socket.io').listen(5001);

const PORT = process.env.PORT || 3200;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

const app = express();

const redisClient = redis.createClient({
  "host": REDIS_HOST,
  "port": REDIS_PORT
});

redisClient.subscribe('rt-change');

io.on('connection', function(socket){
  redisClient.on('message', function(channel, message){
    socket.emit('rt-change', JSON.parse(message));
  });
});

function logErrors (err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({
      error: 'Something failed!',
      success: false,
    });
  } else {
    next(err)
  }
}

function errorHandler (err, req, res, next) {
  res.status(500).send({
    error: 'Something failed!',
    success: false,
  });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);
app.listen(PORT);

app.use(function(req, res) {
  res.status(404).send({
    url: req.originalUrl + ' not found'
  });
});

console.log('Listening on port: ' + PORT);