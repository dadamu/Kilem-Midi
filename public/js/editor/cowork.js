/* global app $ */

app.clickCommitListen = () => {
    $("#tracksContent").on("click", ".version-commit", async function () {
        const trackId = parseInt($(this).parent().parent().attr("trackId"));
        const versions = app.music.getVersions(trackId);
        let version = 1;
        if (versions.length > 0) {
            version = versions[versions.length - 1].version + 1;
        }
        const check = confirm("Commit Check");
        if (!check)
            return;
        const name = prompt("fill version name", `version${version}`);
        try {
            const res = await app.fetchData(`/api/1.0/midi/track/${trackId}`, {
                roomId: app.roomId,
                userId: app.userId,
                name,
                notes: app.music.getNotes(trackId)
            }, "PUT");
            if (res.error) {
                app.errorShow(res.error);
                return;
            }
            app.successShow("Commited");
        }
        catch (e) {
            app.errorShow("Commit failed");
        }
    });
};

app.versionChangeListen = () => {
    $("#tracksContent").on("change", ".version-select", async function () {
        const version = $(this).val();
        const trackId = $(this).closest(".track").attr("trackId");
        const result = await fetch(`/api/1.0/midi/track?trackId=${trackId}&version=${version}`).then(res => res.json());
        if (!result.error) {
            app.music.setNotes(result.trackId, result.notes);
            if (parseInt($(".track.selected").attr("trackId")) === parseInt(result.trackId)) {
                app.panelLoadTrack(result.trackId);
            }
            app.loadRegionNotesRender(result.trackId);
        }
    });
};

app.addTrack = async () => {
    try {
        await app.fetchData("/api/1.0/midi/track", {
            roomId: app.roomId,
            userId: app.userId
        }, "POST");
    }
    catch (e) {
        console.log(e);
    }
};


app.deleteTrackListen = () => {
    $("#deleteTrack").click(async () => {
        const selectedTrack = $(".track.selected");
        const deleteId = parseInt(selectedTrack.attr("trackId"));
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const res = await app.fetchData(`/api/1.0/midi/track/${deleteId}`, data, "Delete");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
    });
};

app.lockClickListen = () => {
    $("#tracksContent").on("click", ".track-lock", async function () {
        const trackId = $(this).closest(".track").attr("trackId");
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const current = app.music.tracks[trackId].notes;
        const version = app.music.getVersion(trackId).version;
        let previous;
        if (version) {
            const get = await fetch(`/api/1.0/midi/track?trackId=${trackId}&version=${version}`).then(res => res.json());
            previous = get.notes;
            if (JSON.stringify(current) !== JSON.stringify(previous)) {
                app.errorShow("Please commit change first");
                return;
            }
        }
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/lock`, data, "PATCH");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
    });
};


app.createNote = async (note) => {
    const { x, y } = note;
    const posX = Math.floor(x / (64 * app.noteGrid)) * (64 * app.noteGrid);
    const pitch = y + 12 * (app.scaleNumMin + 1);
    const trackId = $("#midiPanel").attr("trackId");

    //ignore duplicate not at same pos
    if (app.music.tracks[trackId].notes[posX] && app.music.tracks[trackId].notes[posX].filter(midi => midi.pitch === pitch).length > 0)
        return;
    const { instrument } = app.music.tracks[trackId];
    app.playNote(instrument, pitch);
    const data = {
        type: "createNote",
        userId: app.userId,
        roomId: app.roomId,
        trackId,
        note: { posX, pitch, length: app.noteLength }
    };
    app.emit("noteUpdate", data);
    const newNote = { posX, pitch, length: app.noteLength };
    app.createNoteRender(trackId, newNote);
    app.regionNoteRender(trackId, newNote);
    app.noteIntoTrack(trackId, newNote);
};

app.noteDeleteListen = () => {
    $("#grids").on("dblclick", ".note", async function () {
        const trackId = $("#midiPanel").attr("trackId");
        const posX = $(this).attr("posX");
        const pitch = $(this).attr("pitch");
        const note = { posX, pitch, length: 1 };
        const data = {
            type: "deleteNote",
            userId: app.userId,
            roomId: app.roomId,
            note,
            trackId
        };
        app.emit("noteUpdate", data);
        app.deleteNoteRender(trackId, note);
        app.noteOutTrack(trackId, note);
    });
};

app.changeInstrumentListen = () => {
    $(".tracks-title").on("change", ".instrument-selector", async function () {
        const trackId = $(this).closest(".track").attr("trackId");
        const instrument = $(this).val();
        const roomId = app.roomId;
        const userId = app.userId;
        const data = {
            roomId,
            userId,
            instrument
        };
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/instrument`, data, "PATCH");
        if (res.error) {
            app.errorShow(res.error);
            $(`.track.track-${trackId} .instrument-selector`).val(app.music.tracks[trackId].instrument);
            return;
        }
    });
};