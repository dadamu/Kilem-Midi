/* global $ app */
app.init = async () => {
    app.setConfig();
    await app.setFile();
    app.instruments.piano = app.setPiano();
    app.instruments.bass = app.setBass();
    app.instruments.guitar = app.setGuitar();
    app.initRender();
    await app.socketInit();
    app.UIListen();
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
    app.clickCommitListen();
    app.versionChangeListen();
    app.lockClickListen();
};

app.initRender = () => {
    app.initRegionRender();
    app.initRulerRender();
    app.initKeysRender();
    app.initGridsRender();
    app.initSvgGrids();
    app.initiTrackRender();
    return;
};

$(document).ready(app.init);