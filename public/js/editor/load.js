/* global app MidiFile */
const loadFile = async (user) => {
    const endpoint = `/api/1.0/midi/getFile?room=${app.roomId}&user=${user}`;
    const response = await fetch(endpoint).then(res => res.json());
    return response.data;
};

app.setFile = async () => {
    await loadFile();
    app.music.user = new MidiFile(120);
    if (Object.keys(app.music.user.tracks).length > 0)
        app.trackNum = Object.values(app.music.user.tracks).pop().trackId;
    else
        app.trackNum = 0;
};