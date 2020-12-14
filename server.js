
var http = require('http').createServer((req, res) => res.end());
var io = require('socket.io')(http);

io.use((socket, next) => {
    if(socket.handshake.auth.token === "123") {
        return next()
    } else {
        return next(new Error("Auth Error"))
    }
})

const users = {}
io.on('connection', socket => {
    if(!users[socket.id]) {
        users[socket.id] = null
        socket.emit('register')
    }
    console.log(`${socket.id} connected${users[socket.id] ? ` named ${users[socket.id]}`:""}.`);
    socket.on('register', d => {
        if(!users[socket.id]) {
            users[socket.id] = d.name
            socket.emit('registered', { name: d.name })
        } else {
            socket.emit('registered', { name: users[socket.id] })
        }
    })
    socket.on('msg', d => {
        if(users[socket.id]) {
            console.log(`${users[socket.id]}: ${d.data}`)
            socket.broadcast.emit('msg', { data: `${users[socket.id]}: ${d.data}` })
        } else {
            socket.emit('register')
        }
    })
    socket.on('disconnect', () => console.log(`user ${users[socket.id]}${users[socket.id] && ` named ${users[socket.id]}`} disconnected.`))
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});