import express from 'express'
import uuid from '@uuid/uuidv4'
import Game from 'models/Game'
import Room from 'models/Room'
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

const leaveRooms = (socket) => {
  const roomsToDelete = []
  for (const id in games) {
    const room = games[id]
    if (room.sockets.includes(socket)) { // Check to see if the socket is in the current room
      socket.leave(id)
      room.sockets = room.sockets.filter((item) => item !== socket) // Remove the socket from the room object
    }
    if (room.sockets.length === 0) { // Prepare to delete any rooms that are now empty
      roomsToDelete.push(room)
    }
  }

  for (const room of roomsToDelete) { // Delete all the empty rooms that we found earlier
    delete games[room.id]
  }
}

io.on('connection', function (socket) {
  socket.id = uuid() // Generate a unique ID for the user.

  socket.on('createRoom', (roomName, callback) => {
    const room = new Room(uuid(), roomName, socket.id)
    games[room.id] = room
    joinRoom(socket, room) // Obligatorily, have the socket join the room they've just created.
    callback()
  })

  socket.on('joinRoom', (roomId, callback) => { // Fired when a player has joined a room.
    const room = games[roomId]
    joinRoom(socket, room)
    callback()
  })

  socket.on('getRoomNames', (data, callback) => { // Fired when the player wants to get room names.
    const roomNames = []
    for (const id in games) {
      const { name } = games[id]
      const room = { name, id }
      roomNames.push(room)
    }
    callback(roomNames)
  })

  socket.on('leaveRoom', () => { // Fired when a player leaves a room.
    leaveRooms(socket)
  })

  socket.on('disconnect', () => { // Fired when a player disconnects from the server.
    leaveRooms(socket)
  })
})

http.listen(port, () => {
  console.log(`Now listening at: http://localhost:${port}`)
})
