/* global app io Track $ */
app.on = (event, callback) => {
    app.socket.on(event, callback);
};

app.emit = async (event, Obj) => {
    app.socket.emit(event, Obj);
};

app.socketInit = async () => {
    app.socket = io("/room" + app.roomId, { query: "user=" + app.userId });
    await app.ioListen();
};

app.ioListen = async () => {
    app.on("addTrack", (track) => {
        const { id, name, instrument, locker } = track;
        app.music[app.userId].addTrack(new Track(id, name, instrument));
        app.music[app.userId].getTrack(id).setLocker(locker);
        app.addTrackRender(id, name);
    });
    app.on("commit", (data) => {
        const { track } = data;
        app.music[app.userId].setTrack(track);
        app.addVersionOption(track);
        if (parseInt($(".track.selected").attr("trackId")) === parseInt(track.id)) {
            app.panelLoadTrack(track.id);
        }
    });
    app.on("delete", (data) => {
        const { track } = data;
        const selectedTrack = $(`.track.track-${track.id}`);
        app.music[app.userId].deleteTrack(track.id);
        selectedTrack.remove();
        $(".region.selected").remove();
        $(".track").first().addClass("selected");
        $(".region").first().addClass("selected");
        app.panelLoadTrack($(".region").last().attr("trackId"));
    });
};