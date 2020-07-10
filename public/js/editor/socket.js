/* global app io Track */
app.on = (event, callback) => {
    app.socket.on(event, callback);
};

app.emit = async (event, Obj) => {
    app.socket.emit(event, Obj);
};

app.socketInit = async () => {
    app.socket = io("/room" + app.roomId);
    await app.ioListen();
};

app.ioListen = async() => {
    app.on("connect", () => {
        app.on("addTrack", (track) => {
            const { id, name, instrument, creator } = track;
            app.music[app.userId].addTrack(new Track(id, name, instrument));
            app.music[app.userId].getTrack(id).setCreator(creator);
            app.addTrackRender(id, name);
        });
    });
};