/* global $ app */
app.openMidiPanelListen = () => {
    $("#midiPanelButton").click(() => {
        if ($("#midiPanel").hasClass("hidden")) {
            $("#midiPanel").removeClass("hidden");
        }
        else {
            $("#midiPanel").addClass("hidden");
        }
    });
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

    app.playNote(pitch);
    return noteDiv;
}

app.addMidiNoteListen = () => {
    $("#svgGrid").click(function (evt) {
        const target = evt.target;
        const dim = target.getBoundingClientRect();
        const x = evt.clientX - dim.left;
        const y = evt.clientY - dim.top;
        const note = app.svgToNote(x, y);
        const noteDiv = app.createNote(note);
        $("#grids").append(noteDiv);
        app.noteDeleteListen(noteDiv);
    });
};

app.clickKeysListen = () => {
    $("#keys").on("click", ".key", async function () {
        const target = this;
        const pitch = $(target).attr("pitch");
        app.playNote(pitch);
        return;
    });
};

app.playNote = async (pitch) => {
    const source =app.audioCtx.createBufferSource();
    const {buffer, condition} = app.piano.audio[pitch];
    source.buffer = buffer;
    source.detune.value = condition * 100;
    const duration = 0.5;
    app.fadeAudio(source, duration);
};

app.initSvgGrids = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    const picthHeight = app.picthHeight;
    const musicLength = app.musicLength;
    const keysNum = app.keysNum;
    const svg = app.midiSvgGrid(app.gridsInterval, picthHeight, keysNum, musicLength)
    const grids = $("#grids");
    grids.width(gridsWidth).height(keysNum * picthHeight);
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
}

app.noteDeleteListen = () => {
    $("#grids").on('dblclick', 'div.note', function () {
        $(this).remove();
    });
}