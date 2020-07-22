/* global $ */
const app = {};

app.init = async() => {
    await app.checkToken();
    app.topNavRender();
    app.topNavListen();
};

$(document).ready(app.init);