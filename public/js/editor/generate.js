/* global $ app */
app.init = async () => {
    app.setConfig();
    await app.checkToken();
    await app.setFile();
    app.instruments.piano = app.setPiano(app.instrumentsURL);
    app.instruments.bass = app.setBass(app.instrumentsURL);
    app.instruments.guitar = app.setGuitar(app.instrumentsURL);
    app.instruments.drums = app.setDrums(app.instrumentsURL);
    app.initRender();
    await app.socketInit();
    app.UIListen();
    app.saveFile();
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
    app.initControlRender();
};

$(document).ready(app.init);