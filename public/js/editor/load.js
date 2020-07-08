/* global app MidiFile */
const loadFile = async () => {
    const endpoint = `/api/1.0/midi/getFile?room=${app.roomId}&user=${app.userId}`;
    const response = await fetch(endpoint).then(res => res.json());
    return response.data;
};

app.setFile = async () => {
    const data = await loadFile();
    let { userData } = data;
    console.log(userData);
    userData = JSON.parse(userData);
    app.music[app.userId] = new MidiFile(userData.bpm || 120, userData.tracks || {});
    if (Object.keys(app.music[app.userId].tracks).length > 0)
        app.trackNum = Object.values(app.music[app.userId].tracks).pop().trackId;
    else
        app.trackNum = 0;
};