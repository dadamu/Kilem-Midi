/* global $ app */
app.init = async () => {
    app.setConfig();
    await app.checkToken();
    await app.setFile();
    app.instruments.piano = app.setPiano();
    app.instruments.bass = app.setBass();
    app.instruments.guitar = app.setGuitar();
    app.instruments.drums = app.setDrums();
    app.initRender();
    await app.socketInit();
    app.UIListen();
};

app.UIListen = () => {
    app.trackListen();
    app.midiPanelListen();
    app.chatListen();
    app.loadListen();
    app.noteListen();
    app.controlListen();
    app.coworkListen();
};

app.initRender = () => {
    app.initRegionRender();
    app.initRulerRender();
    app.initKeysRender();
    app.initGridsRender();
    app.initSvgGrids();
    app.initiTrackRender();
    app.initChatRender();
    app.initRegionNoteRender();
    app.filenameRender();
};

$(document).ready(app.init);