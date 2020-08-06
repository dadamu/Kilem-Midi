/* global $ app */
app.init = async () => {
    try {
        app.setConfig();
        await app.checkToken();
        await app.setFile();
        app.initInstruments();
        app.initRender();
        app.socketInit();
        app.UIListen();
        app.saveFile();
        app.openMidiPanel();
    }
    catch(e){
        console.log(e);
        await app.errorShow('Something wrong, Please reload');
        window.location.reload();
    }
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
    app.initControlRender();
    app.initTrackRender();
    app.initRegionRender();
    app.initMidiPanelRender();
    app.initChatRender();
};

$(document).ready(app.init);