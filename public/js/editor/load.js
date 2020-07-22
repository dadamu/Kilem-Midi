/* global app MidiFile $ */
app.loadFile = async () => {
    const endpoint = `/api/1.0/midi/file?roomId=${app.roomId}&userId=${app.userId}`;
    const response = await fetch(endpoint).then(res => res.json());
    if(response.error){
        app.errorShow(response.error);
        window.location.href = "/room";
        return;
    }
    return response.data;
};

app.setFile = async () => {
    const music = await app.loadFile();
    app.filename = music.filename;
    app.music = new MidiFile(music.bpm, music.tracks);
};

app.saveFileListen = () => {
    $("#save").click(() => {
        app.saveFile();
        app.successShow("Save Success");
    });
};

app.saveFile = async () => {
    const endpoint = "/api/1.0/midi/file";
    const data = {};
    data.userId = app.userId;
    data.roomId = app.roomId;
    data.data = app.music.tracks;
    const result = await app.fetchData(endpoint, data, "POST");
    if(result.error){
        app.errorShow("Save Error");
        return;
    }
};