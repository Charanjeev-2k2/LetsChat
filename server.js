//dependencies
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});


//if / received in url then render index.html
app.get("/", (req, res) => {
  res.render("index");
});

//if /create-room/ received in url then redirect to /${uuidV4()} which is caught by app.get("/:room")
app.get("/create-room/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("video-chat-room", { roomId: req.params.room });
});

//On connection
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);

    //disconnect
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });

    //for sending chat messages
    socket.on("send_msg", (message) => {
      //for displaying it on browser
      io.to(roomId).emit('create_message', message);
    });
  });
});


var PORT = process.env.PORT || 3030;

server.listen(PORT, () => console.log(`Server Started on ${PORT}`));
