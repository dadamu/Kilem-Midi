const noteSocket = require("./noteSocket");
const ioDebug = require("debug")("app");
module.exports = {
    start: (io) => {
        io.of((nsp, query, next) => {
            next(null, true);
        }).on("connection", (socket) => {
            ioDebug("Socket Connection");
            socket.join("editor");
            socket.join("chat");

            socket.on("init", (data) => {
                socket.join("editor"+data.userId);
            });

            noteSocket.noteListen(socket);
        });
    }
};