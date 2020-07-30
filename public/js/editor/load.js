/* global app MidiFile $*/

app.loadListen = () => {
    app.saveFileListen();
    app.exportFileListen();
};

app.loadFile = async () => {
    const endpoint = `/api/1.0/midi/file?roomId=${app.roomId}&userId=${app.userId}`;
    const response = await fetch(endpoint).then(res => res.json());
    if (response.error) {
        const res = await app.errorShow(response.error);
        if(res.value){
            window.location.href = "/room";
            return;
        }
    }
    return response.data;
};

app.setFile = async () => {
    const music = await app.loadFile();
    app.roomname = music.roomname;
    app.filename = music.filename;
    app.creator = music.creator;
    app.music = new MidiFile(music.bpm, music.tracks);
};

app.saveFileListen = () => {
    $("#save").click(() => {
        app.saveFile();
        app.successShow("Saved");
    });
};

app.exportFileListen = () => {
    $("#export").click(() => {
        const file = app.music.export();
        const downloadUrl = URL.createObjectURL(file);
        const a = document.createElement("a");
        $(a).attr("href", downloadUrl).attr("download", app.filename);
        $("body").append(a);
        a.click();
        $(a).remove();
        app.successShow("Exported");
    });
};

app.saveFile = async () => {
    const endpoint = "/api/1.0/midi/file";
    const data = {};
    data.userId = app.userId;
    data.roomId = app.roomId;
    data.data = app.music.tracks;
    const result = await app.fetchData(endpoint, data, "POST");
    if (result.error) {
        app.errorShow(result.error);
        return;
    }
};