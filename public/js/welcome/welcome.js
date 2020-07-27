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

$(document).ready(app.init);