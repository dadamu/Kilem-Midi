/* global $ app */
app.init = () => {
    if (window.localStorage.getItem('token')) {
        window.location.href = '/room';
    }
    app.googleInit();
    app.selectTabListen();
    app.signListen();
    app.logoListen();
    $('#signup .username').attr('maxlength', 15);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('test')) {
        const type = urlParams.get('test');
        if (type === 'kilem'){
            $('#signin .email').val('kilem@kilem.com');
            $('#signin .password').val('Kilem123');
        }
    }
};

app.logoListen = () => {
    $('#navLogo').click(() => {
        window.location.href = '/';
    });
};

$(document).ready(app.init);