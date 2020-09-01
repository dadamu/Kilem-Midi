const noteSocket = require('./noteSocket');
const jwt = require('jsonwebtoken');
const { JWT_KEY } = process.env;
const ioDebug = require('debug')('app');
module.exports = {
    start: (io) => {
        io.of((nsp, query, next) => {
            next(null, true);
        }).on('connection', (socket) => {

            ioDebug('Socket Connection');
            socket.join('editor');
            socket.join('chat');
            let user;
            socket.on('init', (info) => {
                user = jwt.verify(info.token, JWT_KEY);
                socket.kilemUser = user;
                socket.join('editor' + user.id);
            });
            noteSocket.noteListen(socket);
            socket.on('error', () => {
                socket.emit('kilemError', {
                    error: 'Failed'
                });
            });

        });

        io.of('/').adapter.on('error', function () {
            ioDebug('ioRedis Error');
        });
    }
};