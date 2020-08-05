/* global $ app */
app.init = () => {
    if(window.localStorage.getItem('token')){
        window.location.href = '/room';
    }
    app.googleInit();
    app.selectTabListen();
    app.signListen();
    app.logoListen();
    $('#signup .username').attr('maxlength', 15);
};

app.logoListen = () => {
    $('#navLogo').click(()=>{
        window.location.href = '/';
    });
};

$(document).ready(app.init);