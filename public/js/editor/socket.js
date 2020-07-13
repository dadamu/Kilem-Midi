/* global app io Track $ */
app.on = (event, callback) => {
    app.socket.on(event, callback);
};

app.emit = async (event, Obj) => {
    app.socket.emit(event, Obj);
};

app.socketInit = async () => {
    app.socket = io("/room" + app.roomId, { query: "user=" + app.userId });
    app.emit("init", { userId: app.userId });
    await app.ioListen();
};

app.ioListen = async () => {
    app.on("addTrack", (track) => {
        const { id, name, instrument, locker } = track;
        app.music.addTrack(new Track(id, name, instrument));
        app.music.getTrack(id).setLocker(locker);
        app.addTrackRender(id, name);
        app.saveFile();
    });
    app.on("commit", (data) => {
        const { track } = data;
        app.music.setTrack(track);
        app.addVersionOption(track);
        if (parseInt($(".track.selected").attr("trackId")) === parseInt(track.id)) {
            app.panelLoadTrack(track.id);
        }
        app.saveFile();
    });
    app.on("deleteTrack", (data) => {
        const { track } = data;
        const selectedTrack = $(`.track.track-${track.id}`);
        app.music.deleteTrack(track.id);
        selectedTrack.remove();
        $(".region.selected").remove();
        $(".track").first().addClass("selected");
        $(".region").first().addClass("selected");
        app.panelLoadTrack($(".region").last().attr("trackId"));
        app.saveFile();
    });

    app.on("lock", (data) => {
        const { track } = data;
        app.music.changeLocker(track.id, track.locker);
        $(`.track.track-${track.id} .track-lock`).html( app.lockerRender(track.locker).html() );
        app.saveFile();
    });

    app.on("chat", (data) => {
        const { chat } = data;
        app.chatRender(chat);
    });

    app.on("createNote", (data) => {
        const { note } = data;
        app.createNoteRender(note);
    });
};