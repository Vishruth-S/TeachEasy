const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');

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
    res.render('home', { id: uuidv4() })
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})


app.post('/create', (req, res) => {
    const name = req.body.name
    const id = req.body.code
    res.redirect(`/${id}`)
})

app.post('/join', (req, res) => {
    const name = req.body.name
    const id = req.body.code
    res.redirect(`/${id}`)
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message, userId)
        })
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
})
server.listen(process.env.PORT || 3030);  