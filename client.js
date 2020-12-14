const readline = require('readline')

const io = require('socket.io-client');
const socket = io("ws://localhost:3000/", {
    reconnectionDelayMax: 10000,
    transports: ['websocket'],
    auth: {
        token: "123"
    }
});
socket.on('register', () => {
    console.log("you are not registered. enter '/name <username>'")
})
socket.on('registered', d => {
    console.log(`you are registered with name: ${d.name}`)
})
var done = false
socket.on('connect', async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    socket.on('disconnect', () => rl.close())
    socket.on('msg', d => console.log(d.data))

    if(done) return; else done = true
    while(true) await new Promise((res, rej) => {
        rl.question('', (answer) => {
            if(answer[0] === '/') {
                socket.emit('register', { name: answer.split(' ')[1] })
                res()
            } else {
                socket.emit('msg', { data: answer })
                res()
            }
        });
    })
})
socket.on('connect_error', (err) => {
    console.log(err.message)
})