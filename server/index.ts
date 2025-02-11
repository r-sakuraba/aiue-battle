import express from 'express';
const http = require('http');
import { Server } from 'socket.io';

const app = express();
const server = http.Server(app);
const io = new Server(server);

const PORT = 3000;

app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile('/opt/render/project/src/index.html');
});

app.get('/room', (req: express.Request, res: express.Response) => {
  res.sendFile('/opt/render/project/src/room.html');
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

let answerObject = {};

let rooms: { [key: string]: { [id: string]: string } } = {};

io.on('connection', (socket) => {
  console.log('user connected');
  io.sockets.emit('changeConnection', io.engine.clientsCount);
  socket.emit('name', socket.id);

  socket.on('joinRoom', ({ roomName, userName }) => {
    if (!rooms[roomName]) {
      rooms[roomName] = {};
    }
    rooms[roomName][socket.id] = userName;
    socket.join(roomName);
    io.to(roomName).emit('userJoined', userName);
    io.to(roomName).emit('changeId2Name', rooms[roomName]);
    console.log(`User ${userName} joined room ${roomName}`);
  });

  socket.on('leaveRoom', ({ roomName, userName }) => {
    delete rooms[roomName][socket.id];
    socket.leave(roomName);
    io.to(roomName).emit('userLeft', userName);
    io.to(roomName).emit('changeId2Name', rooms[roomName]);
    console.log(`User ${userName} left room ${roomName}`);
  });

  socket.on('sendMessage', (message, roomName) => {
    console.log('Message has been sent: ', message);
    io.to(roomName).emit('receiveMessage', message);
  });

  socket.on('sendAnswer', (answer, roomName) => {
    // Handle answer logic here
  });

  socket.on('startGame', async (roomName) => {
    const sockets = await io.in(roomName).fetchSockets();
    answerObject = Object.fromEntries(sockets.map((socket, i) => [socket.id, i]));
    console.log(`server startGame in room ${roomName}`, answerObject);

    io.to(roomName).emit('answerStatus', answerObject);
  });

  socket.on('disconnect', (data) => {
    io.emit('changeConnection', io.engine.clientsCount);
  });
});
