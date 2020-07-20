/* global app $ */

app.clickLogoListen = () => {
    window.location.href = "/room";
};

app.clickUserListen = () => {
    window.location.href = "/profile";
};

app.renderUser = () => {
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