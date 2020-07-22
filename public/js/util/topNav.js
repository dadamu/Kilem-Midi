/* global app $ */

app.topNavRender = () => {
    $("#navProfile span").html(app.username);
};

app.topNavListen = () => {
    $("#navLogo").click(() => {
        window.location.href = "/room";
    });
    $("#navProfile").click(() => {
        window.location.href = "/profile";
    });
};