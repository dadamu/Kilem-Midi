/* global app MidiFile */
const loadFile = async () => {
    const endpoint = `/api/1.0/midi/file?roomId=${app.roomId}&userId=${app.userId}`;
    const response = await fetch(endpoint).then(res => res.json());
    return response.data;
};

app.setFile = async () => {
    const data = await loadFile();
    const { user, master } = data;
    app.fileName = master.fileName;
    if((Object.getOwnPropertyNames(user).length === 0)){
        app.music = new MidiFile(master.bpm, master.tracks);
    }
    else{
        app.music = new MidiFile(user.bpm, user.tracks);
    }
};