/* global $ app */
app.init = async () => {
    app.setConfig();
    await app.checkToken();
    await app.setFile();
    app.instruments.piano = app.setPiano();
    app.instruments.bass = app.setBass();
    app.instruments.guitar = app.setGuitar();
    app.initRender();
    await app.socketInit();
    app.UIListen();
};

app.UIListen = () => {
    app.trackSelectListen();
    app.openMidiPanelListen();
    app.clickKeysListen();

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
    return;
};

$(document).ready(app.init);