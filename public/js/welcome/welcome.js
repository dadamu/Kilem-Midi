/* global $ */
const app = {};

app.init = () => {
    app.getStartListen();
};

app.getStartListen = () => {
    $("#start").click(() => {
        const token = window.localStorage.getItem("token");
        if (!token) {
            window.location.href = "/sign";
        }
        else {
            window.location.href = "/room";
        }
    });
};

$(document).ready(app.init);