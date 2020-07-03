/* global app $ */

app.midiPlayListen = () => {
    $("#playButton").click(() => {
        if (!app.isplaying) {
            app.isplaying = true;
            const maxTime = app.musicLength * 4 / (app.bpm / 60) * 1000;
            app.playInterval = setInterval(() => {
                if (app.currentTime >= maxTime) {
                    clearInterval(app.playInterval);
                    app.isplaying = false;
                }
                app.regionPlayheadTrans();
                if (app.isMidiEditorOpen) {
                    app.midiPlayheadTrans();
                }
                app.currentTime += 50
            }, 50);
        }
    });
};

app.regionPlayheadTrans = () => {
    const currentTime = app.currentTime;
    const intervalX = app.regionInterval;
    const bpm = app.bpm;
    const playOffset = intervalX * bpm / 4 * currentTime / 60 / 1000;
    $('#regionPlayhead').css('-webkit-transform', `translateX(${playOffset}px)`);
};

app.midiPlayheadTrans = () => {
    const currentTime = app.currentTime;
    const intervalX = app.gridsInterval;
    const bpm = app.bpm;
    const playOffset = intervalX * bpm / 4 * currentTime / 60 / 1000;
    $('#midiPlayhead').css('-webkit-transform', `translateX(${playOffset}px)`);
};

app.midiStopListen = () => {
    $("#stopButton").click(() => {
        clearInterval(app.playInterval);
        app.isplaying = false;
    });
};

app.midiResetListen = () => {
    $("#resetButton").click(() => {
        app.currentTime = 0;
        app.regionPlayheadTrans();
        app.midiPlayheadTrans();
    });
};