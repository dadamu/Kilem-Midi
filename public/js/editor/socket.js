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
        app.loadRegionNotesRender(track.id);
        app.saveFile();
    });
    app.on("deleteTrack", (data) => {
        const { track } = data;
        const selectedTrack = $(`.track.track-${track.id}`);
        app.music.deleteTrack(track.id);
        selectedTrack.remove();
        $(`.region.track-${track.id}`).remove();
        $(".track").first().addClass("selected");
        $(".region").first().addClass("selected");
        app.panelLoadTrack($(".region").last().attr("trackId"));
        app.saveFile();
    });

    app.on("lock", (data) => {
        const { track } = data;
        app.music.changeLocker(track.id, track.locker);
        $(`.track.track-${track.id} .track-lock`).html(app.lockerRender(track.locker).html());
        if (track.locker.id === app.userId) {
            $(`.track.track-${track.id} .track-name`).addClass("editable").removeAttr("disabled");
        }
        else {
            $(`.track.track-${track.id} .track-name`).removeClass("editable");
        }
        app.saveFile();
    });

    app.on("trackNameChange", (data) => {
        app.music.tracks[data.id].name = data.name;
        $(`.track.track-${data.id} .track-name`).val(data.name);
    });

    app.on("chat", (data) => {
        const { chat } = data;
        app.chatRender(chat);
    });

    app.on("createNote", (data) => {
        const { note, trackId } = data;
        app.createNoteRender(trackId, note);
        app.regionNoteRender(trackId, note);
        app.noteIntoTrack(trackId, note);
    });

    app.on("deleteNote", (data) => {
        const { note, trackId } = data;
        app.deleteNoteRender(trackId, note);
        app.regionNoteDelete(trackId, note);
        app.noteOutTrack(trackId, note);
    });

    app.on("instrumentSet", (data) => {
        const { track } = data;
        app.music.tracks[track.id].instrument = track.instrument;
        $(`.track.track-${track.id} .instrument-selector`).val(track.instrument);
    });

    app.on("filenameChange", (data) => {
        const { filename } = data;
        app.filename = filename;
        app.filenameRender(filename);
    });

    app.on("bpmChange", async (data) => {
        const { bpm } = data;
        const oldBpm = app.music.bpm;
        app.music.bpm = bpm;
        app.bpmRender(bpm);

        app.loopend = app.loopend * oldBpm / bpm;
        if (app.isplaying) {
            app.currentTime = app.currentTime * oldBpm / bpm; 
            clearInterval(app.playInterval);
            app.isplaying = false;
            app.successShow("Bpm Change");
            app.midiPlay();
        }
    });
};