/* global $ */
const app = {};

app.init = () => {
    app.getStartListen();
};

app.getStartListen = () =>  {
    $("#start").click(()=>{
        window.location.href="/sign";
    });
};

$(document).ready(app.init);