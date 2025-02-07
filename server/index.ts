import express from 'express';
const http = require('http');
import { Server } from 'socket.io';

const app = express();
const server = http.Server(app);
const io = new Server(server);

const PORT = 3000;

app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile('/index.html');
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('user connected222');
  socket.on('sendMessage', (message) => {
    console.log('Message has been sent: ', message);

    // 'receiveMessage' というイベントを発火、受信したメッセージを全てのクライアントに対して送信する
    io.emit('receiveMessage', message);
  });
});
