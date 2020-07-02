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
    const start = Math.floor(x / app.gridsInterval * 4);
    const picth = Math.floor(y / app.picthHeight);
    return { start, picth };
};

app.createNote = (note) => {
    const { start, picth } = note;
    const interval = app.gridsInterval / 4;
    const picthHeight = app.picthHeight;

    const left = start * interval;
    const bottom = picth * picthHeight;

    const noteDiv = $("<div></div>");
    noteDiv.addClass("note").width(interval).height(picthHeight);
    noteDiv.css("left", left).css("bottom", bottom);
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
}

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
}

app.initGridsRender = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    $("#grids").width(gridsWidth);
    return
}

app.noteDeleteListen = () => {
    $("#grids").on('dblclick', 'div.note',function () {
        $(this).remove();
    });
}