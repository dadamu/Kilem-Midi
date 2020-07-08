/* global app $ */

app.saveFileListen = () => {
    $("#save").click(() => {
        app.saveFile("user");
    });
};

app.saveFile = async (user) => {
    const endpoint = "/api/1.0/midi/saveFile";
    const data = {};
    data.user = user;
    data.room = "test";
    data.data = app.music[user];
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