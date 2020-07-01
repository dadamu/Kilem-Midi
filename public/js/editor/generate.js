/* global $ document app */
app.init = async () => {
    await app.render();
    app.addTrack();
    app.UIListen();
};

app.UIListen = () => {
    app.addTrackListen();
    app.deleteTrackListen();
    app.trackSelectListen();
    app.openMidiPanelListen();
};

app.render = () => {
    const pTasks = [];
    pTasks.push(app.rulerScaleRender(5, app.musicLength, app.scaleInterval));
    return Promise.all(pTasks);
};

$(document).ready(app.init);