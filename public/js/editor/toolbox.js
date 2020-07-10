/* global app $ */

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
    data.data = app.music[userId];
    const result = await app.fetchData(endpoint, data, "POST");
    if(result.error){
        alert("Save Error");
    }
};