/* global $ */
const app = {};

app.init = () => {
    if(window.localStorage.getItem("token")){
        window.location.href = "/room";
    }
    app.googleInit();
    app.selectTabListen();
    app.signListen();
    app.getStartListen();
    app.logoListen();
};

app.logoListen = () => {
    $("#navLogo").click(()=>{
        window.location.href = "/";
    });
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