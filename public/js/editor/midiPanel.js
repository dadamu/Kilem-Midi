/* global $ app Note */
app.openMidiPanelListen = () => {
    $("#midiPanelButton").click(() => {
        if ($("#midiPanel").hasClass("hidden")) {
            const trackId = $(".track.selected").attr("trackId");
            $("#midiPanel").removeClass("hidden");
            app.panelLoadTrack(trackId);
            app.isMidiEditorOpen = true;
            app.setCurrentPlayhead(app.currentTime);
        }
        else {
            $("#midiPanel").addClass("hidden");
            app.isMidiEditorOpen = false;
        }
    });
};

app.panelLoadTrack = (trackId) => {
    $("#grids .note").remove();
    if (!$("#midiPanel").hasClass("hidden")) {
        $("#midiPanel").attr("trackId", trackId);
        if (app.music.tracks[trackId]) {
            for (let [posX, notes] of Object.entries(app.music.tracks[trackId].notes)) {
                app.notesRender(posX, notes);
            }
        }
    }
};

app.notesRender = (posX, notes) => {
    for (let note of notes) {
        const { pitch } = note;
        const left = posX / 64 * app.gridsInterval;
        const bottom = (pitch - 12 * (app.scaleNumMin + 1)) * app.picthHeight;
        const noteDiv = $("<div></div>");
        noteDiv.addClass("note").width(app.gridsInterval * note.length).height(app.picthHeight);
        noteDiv.css("left", left).css("bottom", bottom);
        noteDiv.attr("pitch", pitch);
        noteDiv.attr("posX", posX);
        $("#grids").append(noteDiv);
    }
};

app.setCurrentPlayhead = (current) => {
    const intervalX = app.gridsInterval;
    const { bpm } = app.music;
    const currentX = intervalX / 4 * bpm * current / 60 / 1000;
    $("#midiPlayhead").css("-webkit-transform", `translateX(${currentX}px)`);
};

app.svgToNote = (x, y) => {
    const height = app.picthHeight * app.keysNum;
    y = height - y;
    x = Math.floor(x / app.gridsInterval * 64);
    y = Math.floor(y / app.picthHeight);
    return { x, y };
};

app.createNoteRender = (trackId, note) => {
    const panelId = parseInt($("#midiPanel").attr("trackId"));
    if (panelId === parseInt(trackId)) {
        const interval = app.gridsInterval * note.length;
        const pitchHeight = app.picthHeight;
        const left = note.posX * app.gridsInterval / 64;
        const bottom = (note.pitch - 24) * pitchHeight;
        const noteDiv = $("<div></div>");
        noteDiv.addClass("note").width(interval).height(pitchHeight);
        noteDiv.css("left", left).css("bottom", bottom);

        noteDiv.attr("pitch", note.pitch);
        noteDiv.attr("length", note.length);
        noteDiv.attr("posX", note.posX);
        $("#grids").append(noteDiv);
    }
};

app.deleteNoteRender = (trackId, note) => {
    const panelId = parseInt($("#midiPanel").attr("trackId"));
    if (panelId === parseInt(trackId)) {
        $(`div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
    }
};

app.noteIntoTrack = (trackId, note) => {
    app.music.tracks[trackId].addNote(new Note(note.pitch, note.posX, note.length));
};

app.addMidiNoteListen = () => {
    $("#svgGrid").click(function (evt) {
        const trackId = parseInt($("#midiPanel").attr("trackId"));
        if (parseInt(app.userId) != app.music.getLocker(trackId).id) {
            app.errorShow("It's not your locked track");
            return;
        }
        const target = evt.target;
        const dim = target.getBoundingClientRect();
        const x = evt.clientX - dim.left;
        const y = evt.clientY - dim.top;
        const note = app.svgToNote(x, y);
        app.createNote(note);
    });
};

app.clickKeysListen = () => {
    $("#keys").on("click", ".key", async function () {
        const trackId = $("#midiPanel").attr("trackId");
        const { instrument } = app.music.tracks[trackId];
        const target = this;
        const pitch = $(target).attr("pitch");
        app.playNote(instrument, pitch);
        return;
    });
};

app.playNote = async (instrument, pitch) => {
    if (app.instruments[instrument].audio[pitch]) {
        const source = app.audioCtx.createBufferSource();
        const { buffer, pitchShift } = app.instruments[instrument].audio[pitch];
        source.buffer = buffer;
        source.detune.value = pitchShift * 100;
        const duration = 0.5;
        app.fadeAudio(source, duration);
    }
};

app.initSvgGrids = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    const picthHeight = app.picthHeight;
    const musicLength = app.musicLength;
    const keysNum = app.keysNum;
    const grids = $("#grids");
    $("#midiPlayhead").height(keysNum * picthHeight);
    grids.width(gridsWidth).height(keysNum * picthHeight);
    const svg = app.midiSvgGrid(app.gridsInterval, picthHeight, keysNum, musicLength);
    grids.html(svg);
    return;
};

app.initKeysRender = () => {
    let keysHtml = "";
    for (let i = app.scaleNumMax; i >= app.scaleNumMin; i--) {
        keysHtml += app.midiKeysTemplate(i);
    }
    $("#keys").html(keysHtml);
    return;
};

app.initGridsRender = () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    $("#grids").width(gridsWidth);
    return;
};

app.noteOutTrack = (trackId, note) => {
    app.music.tracks[trackId].deleteNote(new Note(note.pitch, note.posX, 1));
};

app.noteGridListen = () => {
    $(".midi-toolbox").on("click", ".note-grid", function () {
        $(".note-grid.selected").removeClass("selected");
        $(this).addClass("selected");
        app.noteGrid = $(this).attr("value");
    });
};

app.noteLengthListen = () => {
    $(".midi-toolbox").on("click", ".note-length", function () {
        $(".note-length.selected").removeClass("selected");
        $(this).addClass("selected");
        app.noteLength = $(this).attr("value");
    });
};