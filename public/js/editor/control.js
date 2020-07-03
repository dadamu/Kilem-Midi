/* global app $ */

app.midiPlayListen = () => {
    $("#playButton").click(() => {
        app.midiPlay();
    });
};

app.midiPlay = () => {
    if (!app.isplaying) {
        const tracks = app.setPlayingTracks();
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
            app.playTracks(tracks);
            app.currentTime += 50
        }, 50);
    }
};

app.playTracks = (tracks) => {
    for (let id in tracks) {
        app.playTrack(tracks[id]);
    }
}

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
        clearInterval(app.playInterval);
        app.isplaying = false;
    });
};

app.setPlayingTracks = () => {
    return JSON.parse(JSON.stringify(app.tracks));
}

app.playTrack = (track) => {
    const posX = Math.floor(app.currentTime / (1 / (app.bpm / 60) * 1000));
    if (track[posX]) {
        app.playTrackNotes(track.instrument, track[posX]);
        delete track[posX];
    }
};

app.playTrackNotes = (instrument, notesSet) => {
    for (let pitch of notesSet) {
        if (app.instruments[instrument].audio[pitch]) {
            const source = app.audioCtx.createBufferSource();
            const { buffer, pitchShift } = app.instruments[instrument].audio[pitch];
            source.buffer = buffer;
            source.detune.value = pitchShift * 100;
            const duration = 1 / (app.bpm / 60);
            app.fadeAudio(source, duration);
        }
    }
};


app.fadeAudio = function (source, duration) {
    const currentTime = app.audioCtx.currentTime;
    const gain = app.audioCtx.createGain();
    gain.gain.linearRampToValueAtTime(0, currentTime + duration);

    source.connect(gain);
    gain.connect(app.audioCtx.destination);
    source.start(0);
    source.stop(currentTime + duration);
};