import express from 'express'
import uuid from '@uuid/uuidv4'
import Game from 'models/Game'
import 'dotenv/config'

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 5000

const games = {}

app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.json({ success: true, time: Date.now() }) // Sends success and the current time.
})

const joinRoom = (socket, room) => {
  room.sockets.push(socket)
  socket.join(room.id, () => {
    socket.roomId = room.id // Store the room ID in the socket for future use.
    console.log(socket.id, 'Joined', room.id)
  })
}

io.on('connection', function (socket) {
  socket.id = uuid()

  socket.on('createRoom', (roomName, callback) => {
    const room = new Game(uuid(), roomName, socket.id)
    games[room.id] = room
    joinRoom(socket, room) // Obligatorily, have the socket join the room they've just created.
    callback()
  })
})

app.listen(port, () => {
  console.log(`Now listening at: http://localhost:${port}`)
})
