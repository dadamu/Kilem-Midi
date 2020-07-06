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
    $("#midiPanel").attr("trackId", trackId);
    if (app.music[app.user].tracks[trackId]) {
        for (let [posX, notes] of Object.entries(app.music[app.user].tracks[trackId].notes)) {
            app.notesRender(posX, notes);
        }
    }
};

app.notesRender = (posX, notes) => {
    for (let note of notes) {
        const { pitch } = note;
        const left = posX / 64  * app.gridsInterval;
        const bottom = (pitch - 12 * (app.scaleNumMin + 1)) * app.picthHeight;
        const noteDiv = $("<div></div>");
        noteDiv.addClass("note").width(app.gridsInterval / app.noteLength).height(app.picthHeight);
        noteDiv.css("left", left).css("bottom", bottom);
        noteDiv.attr("pitch", pitch);
        $("#grids").append(noteDiv);
    }
};

app.setCurrentPlayhead = (current) => {
    const intervalX = app.gridsInterval;
    const { bpm } = app.music[app.user];
    const currentX = intervalX / 4 * bpm * current / 60 / 1000;
    $('#midiPlayhead').css('-webkit-transform', `translateX(${currentX}px)`);
};

app.svgToNote = (x, y) => {
    const height = app.picthHeight * app.keysNum;
    y = height - y;
    x = Math.floor(x / app.gridsInterval * 64);
    y = Math.floor(y / app.picthHeight);
    return { x, y };
};

app.createNote = (note) => {
    const { x, y } = note;
    const interval = app.gridsInterval / app.noteLength;
    const picthHeight = app.picthHeight;

    const left = Math.floor(x / (64 / app.noteGrid)) * (64 / app.noteGrid) * app.gridsInterval / 64;
    const bottom = y * picthHeight;

    const noteDiv = $("<div></div>");
    noteDiv.addClass("note").width(interval).height(picthHeight);
    noteDiv.css("left", left).css("bottom", bottom);

    const pitch = y + 12 * (app.scaleNumMin + 1);
    noteDiv.attr("pitch", pitch);
    $("#grids").append(noteDiv);

    const posX = Math.floor(x / (64 / app.noteGrid)) * (64 / app.noteGrid);
    app.noteIntoTrack(posX, pitch);
    const trackId = $("#midiPanel").attr("trackId");
    const { instrument } = app.music[app.user].tracks[trackId];
    app.playNote(instrument, pitch);
};

app.noteIntoTrack = (posX, pitch) => {
    const trackId = $("#midiPanel").attr("trackId");
    app.music[app.user].tracks[trackId].addNote(new Note(pitch, posX, 1));
}

app.addMidiNoteListen = () => {
    $("#svgGrid").click(function (evt) {
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
        const { instrument } = app.music[app.user].tracks[trackId];
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

app.initKeysRender = async () => {
    let keysHtml = "";
    for (let i = app.scaleNumMax; i >= app.scaleNumMin; i--) {
        keysHtml += app.midiKeysTemplate(i);
    }
    $("#keys").html(keysHtml);
    return;
};

app.initGridsRender = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    $("#grids").width(gridsWidth);
    return
};

app.notOutTrack = (target) => {
    const posX = Math.floor(parseInt($(target).css("left").replace("px")) / (app.gridsInterval / 64));
    const pitch = parseInt($(target).attr("pitch"));
    const trackId = $("#midiPanel").attr("trackId");
    app.music[app.user].tracks[trackId].deleteNote(new Note(pitch, posX, 1));
};

app.noteDeleteListen = () => {
    $("#grids").on('dblclick', '.note', function () {
        app.notOutTrack(this);
        $(this).remove();
    });
};

app.noteGridListen = () => {
    $(".midi-toolbox").on('click', '.note-grid', function () {
        $(".note-grid.selected").removeClass("selected");
        $(this).addClass("selected");
        app.noteGrid = parseInt($(this).attr("value"));
    });
};

app.noteLengthListen = () => {
    $(".midi-toolbox").on('click', '.note-length', function () {
        $(".note-length.selected").removeClass("selected");
        $(this).addClass("selected");
        app.noteLength = parseInt($(this).attr("value"));
        console.log($(this).val());
    });
};