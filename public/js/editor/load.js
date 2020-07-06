/* global app fetch MidiDoc */

const loadFile = async() => {
    const endpoint = `/api/1.0/midi/getFile?room=${app.room}&user=${app.user}`;
    const response = await fetch(endpoint).then(res=>res.json());
    const save = response.data.save;
    return  new MidiDoc(save.bpm, save.tracks);
};

app.setFile = async()=> {
    app.music[app.user] = await loadFile();
    app.trackNum = Object.values(app.music[app.user].tracks).pop().trackId;
};