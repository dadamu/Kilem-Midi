/* global app MidiFile $ Swal*/

app.loadListen = () => {
    app.saveFileListen();
    app.exportFileListen();
};

app.loadFile = async () => {
    const endpoint = `/api/1.0/midi/file?roomId=${app.roomId}&userId=${app.userId}`;
    const response = await fetch(endpoint).then(res => res.json());
    if (response.error) {
        app.errorShow(response.error);
        window.location.href = "/room";
        return;
    }
    return response.data;
};

app.setFile = async () => {
    const music = await app.loadFile();
    app.filename = music.filename;
    app.creator = music.creator;
    app.music = new MidiFile(music.bpm, music.tracks);
};

app.saveFileListen = () => {
    $("#save").click(() => {
        app.saveFile();
        app.successShow("Save Success");
    });
};

app.exportFileListen = () => {
    $("#export").click(() => {
        const file = app.music.export();
        const downloadUrl = URL.createObjectURL(file);
        const a = $("<a></a>").attr("href", downloadUrl).addClass("download").attr("download", app.filename);
        const span = $("<span></span>").text("download");
        a.append(span);
        Swal.fire({
            icon: "success",
            title: "Exported",
            footer: a
        });
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
        app.errorShow("Save Error");
        return;
    }
};