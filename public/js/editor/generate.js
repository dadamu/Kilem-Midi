/* global $ document app */
app.init = async () => {
    app.startUserMedia();
    await app.initRender();
    app.addTrack();
    app.UIListen();
    app.instruments.piano = app.setPiano();
    app.instruments.bass = app.setBass();
    app.instruments.guitar = app.setGuitar();
};

app.UIListen = () => {
    app.addTrackListen();
    app.deleteTrackListen();
    app.trackSelectListen();
    app.openMidiPanelListen();
    app.addMidiNoteListen();
    app.noteDeleteListen();
    app.clickKeysListen();
    app.midiPlayListen();
    app.midiStopListen();
    app.midiResetListen();
    app.changeInstrumentListen();
};

app.initRender = () => {
    const pTasks = [];
    pTasks.push(app.initRegionRender());
    pTasks.push(app.initRulerRender());
    pTasks.push(app.initKeysRender());
    pTasks.push(app.initGridsRender());
    pTasks.push(app.initSvgGrids());
    return Promise.all(pTasks);
};

$(document).ready(app.init);