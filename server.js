const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
const { addUser, removeUser, getUser, getUsers } = require('./users')

const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: true
}))

app.use('/peerjs', peerServer)
app.get('/', (req, res) => {
    // res.redirect(`/${uuidv4()}`)
    res.render('home', { id: RandomIdGenerate(9) })
})

app.get('/:room', (req, res) => {
    const name = req.query.name
    res.render('room', { roomId: req.params.room, username: name })
})


app.post('/create', (req, res) => {
    const name = req.body.name.trim()
    const id = req.body.code.trim()
    res.redirect(`/${id}?name=${name}`)
})

app.post('/join', (req, res) => {
    const name = req.body.name.trim()
    const id = req.body.code.trim()
    res.redirect(`/${id}?name=${name}`)
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, username) => {
        addUser({ id: userId, name: username, room: roomId });

        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId, username);

        // socket.emit('createMessage', `${username}, welcome to the room`, "admin")
        // socket.broadcast.to(roomId).emit('createMessage', `${username} has joined`, "admin")

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message, username)
        })
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
            removeUser({ id: userId, name: username, room: roomId })
        })
    })
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    console.log(getUsers())
})

const RandomIdGenerate = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz'
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 1; i <= length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
        i % 3 === 0 && i !== length ? result += "-" : null
    }

    return result;
}

server.listen(process.env.PORT || 3030);  