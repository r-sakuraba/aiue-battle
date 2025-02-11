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

let aiueBattleList: { [gameId: string]: { info: { [socketId: string]: { answer: string; visible: boolean[] } } } } = {};

io.on('connection', (socket) => {
  console.log('user connected');
  io.sockets.emit('changeConnection', io.engine.clientsCount);
  socket.emit('name', socket.id);
  let _roomName = '';

  socket.on('joinRoom', ({ roomName, userName }) => {
    if (!rooms[roomName]) {
      rooms[roomName] = {};
    }
    rooms[roomName][socket.id] = userName;
    socket.join(roomName);
    _roomName = roomName;
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

  socket.on('readyGame', async (answer) => {
    if (!aiueBattleList[_roomName]) {
      aiueBattleList[_roomName] = { info: {} };
    }
    aiueBattleList[_roomName].info[socket.id] = { answer: answer, visible: Array(7).fill(false) };

    const memberNumInRoom = io.sockets.adapter.rooms.get(_roomName)?.size ?? 0;
    if (Object.keys(aiueBattleList[_roomName].info).length === memberNumInRoom) {
      io.to(_roomName).emit('startGame', aiueBattleList[_roomName]);
    }
  });

  socket.on('disconnect', (data) => {
    if (_roomName) {
      const userName = rooms[_roomName][socket.id];
      delete rooms[_roomName][socket.id];
      socket.leave(_roomName);
      io.to(_roomName).emit('userLeft', userName);
      io.to(_roomName).emit('changeId2Name', rooms[_roomName]);
      console.log(`User ${userName} left room ${_roomName}`);
    }
    io.emit('changeConnection', io.engine.clientsCount);
  });
});
