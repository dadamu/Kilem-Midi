/* global $ */
const app = {};

app.init = () => {
    app.selectTabListen();
    app.signListen();
};

app.signListen = () => {
    $("#signin button").click(async () => {
        const email = $("#signin .email").val();
        const password = $("#signin .password").val();
        const data = { email, password, provider: "native" };
        const res = await app.fetchData("/api/1.0/user/signin", data, "POST");
        if (res.error) {
            alert(res.error);
        }
        else {
            alert("SignIn Success");
            window.localStorage.setItem("token", res.accessToken);
            window.localStorage.setItem("username", res.user.username);
            window.location.href = "/room";
        }
    });
    $("#signup button").click(async() => {
        const email = $("#signup .email").val();
        const username = $("#signup .username").val();
        const password = $("#signup .password").val();
        const data = { email, username, password, provider: "native" };
        const res = await app.fetchData("/api/1.0/user/signup", data, "POST");
        if (res.error) {
            alert(res.error);
        }
        else {
            alert("Signup Success");
            window.localStorage.setItem("token", res.accessToken);
            window.localStorage.setItem("username", res.user.username);
            window.location.href = "/room";
        }
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

$(document).ready(app.init);