module.exports = {
    start: (io) => {
        io.of((nsp, query, next) => {
            next(null, true);
        }).on("connection", (socket) => {
            //const user = socket.handshake.query.user;
            socket.join("editor");
            socket.join("chat");

            socket.on("hi", ()=>{
                console.log(socket.id);
            });
        });
    }
};