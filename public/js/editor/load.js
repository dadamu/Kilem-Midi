/* global app MidiFile $ */
const loadFile = async () => {
    const endpoint = `/api/1.0/midi/file?roomId=${app.roomId}&userId=${app.userId}`;
    const response = await fetch(endpoint).then(res => res.json());
    return response.data;
};

app.setFile = async () => {
    const music = await loadFile();
    app.fileName = music.fileName;
    app.music = new MidiFile(music.bpm, music.tracks);
};

app.saveFileListen = () => {
    $("#save").click(() => {
        app.saveFile(app.userId, app.roomId);
    });
};

app.saveFile = async (userId, roomId) => {
    const endpoint = "/api/1.0/midi/file";
    const data = {};
    data.userId = userId;
    data.roomId = roomId;
    data.data = app.music.tracks;
    const result = await app.fetchData(endpoint, data, "POST");
    if(result.error){
        alert("Save Error");
        return;
    }
    alert("Save Success");
};