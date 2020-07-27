/* global app $ */

app.topNavRender = () => {
    $("#navProfile span").html(app.username);
};

app.topNavListen = () => {
    $("#navLogo").click(() => {
        window.location.href = "/room";
    });
    $("#logOut").click(() => {
        window.localStorage.removeItem("token");
        window.location.href = "/";
    });
};