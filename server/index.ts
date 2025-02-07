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

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

let answerObject = {};

io.on('connection', (socket) => {
  console.log('user connected');
  io.sockets.emit('changeConnection', io.engine.clientsCount);
  socket.emit('name', socket.id);
  socket.on('sendMessage', (message) => {
    console.log('Message has been sent: ', message);

    // 'receiveMessage' というイベントを発火、受信したメッセージを全てのクライアントに対して送信する
    io.emit('receiveMessage', message);
  });
  socket.on('sendAnswer', (answer) => {});
  socket.on('startGame', async () => {
    const sockets = await io.fetchSockets();
    answerObject = Object.fromEntries(sockets.map((socket, i) => [socket.id, i]));
    console.log(`server startGame`, answerObject);

    io.sockets.emit('answerStatus', answerObject);
  });

  socket.on('disconnect', (data) => {
    io.sockets.emit('changeConnection', io.engine.clientsCount);
  });
});
