/* global $ */
const app = {};

app.init = () => {
    app.selectTabListen();
    app.signListen();
};

app.signListen = () => {
    $("#signin button").click(()=>{
        window.location.href="/room";
    });
    $("#signup button").click(()=>{
        window.location.href="/room";
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