/* global $ app */
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
    for (let [posX, pitches] of Object.entries(app.tracks[trackId])) {
        if (parseInt(posX) >= 0) {
            app.notesRender(posX, pitches);
        }
    }
};

app.notesRender = (posX, pitches) => {
    for (let pitch of pitches) {
        const left = Math.floor(posX * app.gridsInterval / 4);
        const bottom = (pitch - 12 * (app.scaleNumMin + 1)) * app.picthHeight;
        const noteDiv = $("<div></div>");
        noteDiv.addClass("note").width(app.gridsInterval / 4).height(app.picthHeight);
        noteDiv.css("left", left).css("bottom", bottom);
        noteDiv.attr("pitch", pitch);
        $("#grids").append(noteDiv);
    }
};

app.setCurrentPlayhead = (current) => {
    const intervalX = app.gridsInterval;
    const bpm = app.bpm;
    const currentX = intervalX / 4 * bpm * current / 60 / 1000;
    $('#midiPlayhead').css('-webkit-transform', `translateX(${currentX}px)`);
};

app.svgToNote = (x, y) => {
    const height = app.picthHeight * app.keysNum;
    y = height - y;
    x = Math.floor(x / app.gridsInterval * 4);
    y = Math.floor(y / app.picthHeight);
    return { x, y };
};

app.createNote = (note) => {
    const { x, y } = note;
    const interval = app.gridsInterval / 4;
    const picthHeight = app.picthHeight;

    const left = x * interval;
    const bottom = y * picthHeight;

    const noteDiv = $("<div></div>");
    noteDiv.addClass("note").width(interval).height(picthHeight);
    noteDiv.css("left", left).css("bottom", bottom);

    const pitch = y + 12 * (app.scaleNumMin + 1);
    noteDiv.attr("pitch", pitch);
    $("#grids").append(noteDiv);
    app.noteIntoTrack(x, pitch);
    const trackId = $("#midiPanel").attr("trackId");
    const instrument = app.tracks[trackId].instrument;
    app.playNote(instrument, pitch);
};

app.noteIntoTrack = (posX, pitch) => {
    const trackId = $("#midiPanel").attr("trackId");
    if (!app.tracks[trackId][posX]) {
        app.tracks[trackId][posX] = [...new Set([pitch])];
    }
    else {
        app.tracks[trackId][posX] = [...new Set(app.tracks[trackId][posX]).add(pitch)];
    }
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
        const instrument = app.tracks[trackId].instrument;
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
    const posX = Math.floor(parseInt($(target).css("left").replace("px")) / (app.gridsInterval / 4));
    const pitch = parseInt($(target).attr("pitch"));
    const trackId = $("#midiPanel").attr("trackId");
    const newSet = new Set(app.tracks[trackId][posX]);
    newSet.delete(pitch);
    app.tracks[trackId][posX] = [...newSet];
};

app.noteDeleteListen = () => {
    $("#grids").on('dblclick', '.note', function () {
        app.notOutTrack(this);
        $(this).remove();
    });
};