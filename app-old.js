const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/', (req, res) => {
  io.emit('message', JSON.stringify(req.body));
  console.log(req.body.subject + req.body.text);
  res.sendStatus(200);
});

app.post('/parse/', (req, res) => {
  io.emit('message', req.body.text);
  console.log(req.body);
  res.sendStatus(200);
});

app.post('/parse/400', (req, res) => {
  io.emit('message', '400' + req.body);
  console.log('400');
  res.sendStatus(400);
});

app.post('/parse/500', (req, res) => {
  io.emit('message', '500');
  console.log('500');
  res.sendStatus(500);
});

io.on('connection', (socket) => {
  console.log('connection');
  socket.on('disconnect', () => {
    console.log('disconnect');
  });
});

httpServer.listen(3000);
