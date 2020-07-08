/* global app $ */

app.saveFileListen = () => {
    $("#save").click(() => {
        app.saveFile(app.userId, app.roomId);
    });
};

app.saveFile = async (userId, roomId) => {
    const endpoint = "/api/1.0/midi/saveFile";
    const data = {};
    data.userId = userId;
    data.roomId = roomId;
    data.data = app.music[userId];
    console.log(data);
    const result = await app.postData(endpoint, data);
    console.log(result);
};

app.postData = (url, data) => {
    return fetch(url, {
        body: JSON.stringify(data),
        headers: {
            "user-agent": "Mozilla/4.0 MDN Example",
            "content-type": "application/json"
        },
        method: "POST",

    }).then(response => response.json());
};