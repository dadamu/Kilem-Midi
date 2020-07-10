/* global app io Track $ */
app.on = (event, callback) => {
    app.socket.on(event, callback);
};

app.emit = async (event, Obj) => {
    app.socket.emit(event, Obj);
};

app.socketInit = async () => {
    app.socket = io("/room" + app.roomId, {query: "user=" + app.userId});
    await app.ioListen();
};

app.ioListen = async() => {
    app.on("addTrack", (track) => {
        const { id, name, instrument, creator } = track;
        app.music[app.userId].addTrack(new Track(id, name, instrument));
        app.music[app.userId].getTrack(id).setCreator(creator);
        app.addTrackRender(id, name);
    });
    app.on("commit", (data) => {
        const { track } = data;
        app.music[app.userId].setTrack(track);
        app.addVersionOption(track);
        if( parseInt($(".track.selected").attr("trackId")) === parseInt(track.id)){
            app.panelLoadTrack(track.id);
        }
    });
};