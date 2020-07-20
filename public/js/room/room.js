/* global $ */
const app = {};

app.init = async() => {
    await app.checkToken();
    app.renderUser();
    app.selectTabListen();
    app.topNavListen();
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