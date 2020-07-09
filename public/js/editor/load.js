/* global app MidiFile MasterMidi */
const loadFile = async () => {
    const endpoint = `/api/1.0/midi/getFile?roomId=${app.roomId}&userId=${app.userId}`;
    const response = await fetch(endpoint).then(res => res.json());
    return response.data;
};

app.setFile = async () => {
    const data = await loadFile();
    console.log(data);
    let { user, master } = data;
    app.music.master = new MasterMidi(master.fileName, master.bpm, master.tracks);
    app.music[app.userId] = new MidiFile(user.bpm || 120, user.instrument, user.tracks || {});
    if (Object.keys(app.music[app.userId].tracks).length > 0)
        app.trackNum = Object.values(app.music[app.userId].tracks).pop().trackId;
    else
        app.trackNum = 0;
};