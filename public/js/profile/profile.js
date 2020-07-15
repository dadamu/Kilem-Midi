/* global $ */
const app = {};

app.init = () => {
    app.topNavListen();
};

app.topNavListen = () => {
    $("#navLogo").click(() => {
        window.location.href = "/room";
    });
    $("#navProfile").click(() => {
        window.location.href = "/profile";
    });
};
$(document).ready(app.init);