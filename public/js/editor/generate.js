/* global $ document app */
app.init = async () => {
    app.setConfig();
    await app.initRender();
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
    app.saveFileListen();
    app.noteLengthListen();
    app.noteGridListen();
};

app.initRender = () => {
    const pTasks = [];
    pTasks.push(app.initRegionRender());
    pTasks.push(app.initRulerRender());
    pTasks.push(app.initKeysRender());
    pTasks.push(app.initGridsRender());
    pTasks.push(app.initSvgGrids());
    pTasks.push(app.initiTrackRender());
    pTasks.push(app.setFile());
    return Promise.all(pTasks);
};

$(document).ready(app.init);