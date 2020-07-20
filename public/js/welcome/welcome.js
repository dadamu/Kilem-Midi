/* global $ */
const app = {};

app.init = () => {
    app.getStartListen();
};

app.getStartListen = () => {
    $("#start").click(() => {
        const token = window.localStorage.getItem("token");
        const username = window.localStorage.getItem("username");
        if (!token || !username) {
            window.location.href = "/sign";
        }
        else {
            window.location.href = "/room";
        }
    });
};

$(document).ready(app.init);