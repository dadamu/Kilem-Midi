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


app.initSvgGrids = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    const keysNum = app.keysNum;
    const svg = app.midiSvgGrid(app.gridsInterval, app.gridHeight, keysNum)
    const grids = $("#grids");
    grids.width(gridsWidth).height(keysNum * 19);
    grids.html(svg);
    return;

   
}

app.initGridsRender = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    $("#grids").width(gridsWidth);
    return
}