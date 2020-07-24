/* eslint-disable no-unused-vars */
/* global $ gapi */
const app = {};

app.init = () => {
    app.googleInit();
    app.selectTabListen();
    app.signListen();
    app.twitterSignListen();
};

app.signListen = () => {
    $("#nativeSignin").click(async () => {
        const email = $("#signin .email").val();
        const password = $("#signin .password").val();
        const data = { email, password, provider: "native" };
        const res = await app.fetchData("/api/1.0/user/signin", data, "POST");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }

        window.localStorage.setItem("token", res.accessToken);
        window.location.href = "/room";

    });
    $("#nativeSignup").click(async () => {
        const email = $("#signup .email").val();
        const username = $("#signup .username").val();
        const password = $("#signup .password").val();
        const data = { email, username, password, provider: "native" };
        const res = await app.fetchData("/api/1.0/user/signup", data, "POST");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }

        window.localStorage.setItem("token", res.accessToken);
        window.location.href = "/room";
    });
};

app.selectTabListen = () => {
    $(".tab a").on("click", function (e) {
        e.preventDefault();
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
        const target = $(this).attr("href");
        $(".tab-content > section").not(target).hide();
        $(target).fadeIn(600);
    });
};

app.googleInit = () => {
    gapi.load("auth2", function () {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        app.googleAuth = gapi.auth2.init({
            client_id: "665609715190-f40ptih854hfasool8rab9er5b66nisb.apps.googleusercontent.com",
            cookiepolicy: "single_host_origin"
        });
        app.googleSignin(document.getElementById("googleSignin"));
        app.googleSignup(document.getElementById("googleSignup"));
    });
};

app.googleSignin = (element) => {
    app.googleAuth.attachClickHandler((element), {}, async function (googleUser) {
        const data = {
            accessToken: googleUser.getAuthResponse().id_token,
            provider: "google"
        };
        const res = await app.fetchData("/api/1.0/user/signin", data, "POST");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }

        window.localStorage.setItem("token", res.accessToken);
        window.location.href = "/room";
    }, function (err) {
        app.errorShow(err);
    });
};

app.googleSignup = (element) => {
    app.googleAuth.attachClickHandler((element), {}, async function (googleUser) {
        const data = {
            accessToken: googleUser.getAuthResponse().id_token,
            provider: "google"
        };
        const res = await app.fetchData("/api/1.0/user/signup", data, "POST");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }

        window.localStorage.setItem("token", res.accessToken);
        window.location.href = "/room";
    }, function (err) {
        app.errorShow(err);
    });
};

$(document).ready(app.init);