/* global app $ */

app.midiPlayListen = () => {
    $("#playButton").click(() => {
        app.midiPlay();
    });
};

app.midiPlay = () => {
    if (!app.isplaying) {
        const bpm = app.music[app.user].bpm;
        const resolution = 1 / (bpm / 60) / 16 * 1000;
        const tracks = app.music[app.user].outPutPlayMidi();
        app.isplaying = true;
        const maxTime = app.musicLength * 4 / (bpm / 60) * 1000;
        app.playInterval = setInterval(() => {
            if (app.currentTime >= maxTime) {
                clearInterval(app.playInterval);
                app.isplaying = false;
            }
            app.regionPlayheadTrans(bpm);
            if (app.isMidiEditorOpen) {
                app.midiPlayheadTrans(bpm);
            }
            app.playTracks(bpm, tracks);
            app.currentTime += resolution;
        }, resolution);
    }
};

app.playTracks = (bpm, tracks) => {
    for (let id in tracks) {
        app.playTrack(bpm, tracks[id]);
    }
};

app.regionPlayheadTrans = (bpm) => {
    const currentTime = app.currentTime;
    const intervalX = app.regionInterval;
    const playOffset = intervalX * bpm / 4 * currentTime / 60 / 1000;
    $("#regionPlayhead").css("-webkit-transform", `translateX(${playOffset}px)`);
};

app.midiPlayheadTrans = (bpm) => {
    const currentTime = app.currentTime;
    const intervalX = app.gridsInterval;
    const playOffset = intervalX * bpm / 4 * currentTime / 60 / 1000;
    $("#midiPlayhead").css("-webkit-transform", `translateX(${playOffset}px)`);
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
        const bpm = app.music[app.user].bpm;
        app.regionPlayheadTrans(bpm);
        app.midiPlayheadTrans(bpm);
        clearInterval(app.playInterval);
        app.isplaying = false;
    });
};

app.setPlayingTracks = () => {
    return JSON.parse(JSON.stringify(app.tracks));
};

app.playTrack = (bpm, track) => {
    const posX = Math.floor(app.currentTime / (1 / (bpm / 60) * 1000) * 16);
    if (track.notes[posX]) {
        app.playTrackNotes(bpm, track.instrument, track.notes[posX]);
        delete track.notes[posX];
    }
};

app.playTrackNotes = (bpm, instrument, notes) => {
    for (let note of notes) {
        if (app.instruments[instrument].audio[note.pitch]) {
            const source = app.audioCtx.createBufferSource();
            const { buffer, pitchShift } = app.instruments[instrument].audio[note.pitch];
            source.buffer = buffer;
            source.detune.value = pitchShift * 100;
            const time = (1 / (bpm / 60)) * ( 4 / note.length );
            app.fadeAudio(source, time);
        }
    }
};


app.fadeAudio = function (source, time) {
    const currentTime = app.audioCtx.currentTime;
    const gain = app.audioCtx.createGain();
    gain.gain.linearRampToValueAtTime(0, currentTime + time * 120/100);

    source.connect(gain);
    gain.connect(app.audioCtx.destination);
    source.start(0);
    source.stop(currentTime + time);
};