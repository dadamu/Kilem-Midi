/* global app MidiFile MasterMidi */
const loadFile = async (user) => {
    const endpoint = `/api/1.0/midi/getFile?room=${app.roomId}&user=${user}`;
    const response = await fetch(endpoint).then(res => res.json());
    const save = response.data.save;
    if (save) {
        return new MidiFile(save.bpm || 120, save.tracks);
    }
    else {
        return new MidiFile(120);
    }
};

const loadMasterFile = async () => {
    const endpoint = `/api/1.0/midi/getFile?room=${app.roomId}&user=master`;
    const response = await fetch(endpoint).then(res => res.json());
    const save = response.data.save;
    return new MasterMidi(save.fileName, save.bpm || 120, save.tracks || {});
};

app.setFile = async () => {
    const files = await Promise.all([loadFile(app.user), loadMasterFile()]);
    app.music[app.user] = files[0];
    app.music.master = files[1];
    if (Object.keys(app.music[app.user].tracks).length > 0)
        app.trackNum = Object.values(app.music.master.tracks).pop().trackId;
    else
        app.trackNum = 0;
};