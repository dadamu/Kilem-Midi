/* global $ */
const app = {};

app.init = async () => {
    await app.checkToken();
    await app.renderRoom();
    app.renderUser();
    app.selectTabListen();
    app.topNavListen();
    app.roomListen();
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

app.roomListen = () => {
    const $cell = $(".room");
    //open and close card when clicked on card
    $cell.on("click", ".js-expander", function () {

        const $thisCell = $(this).closest(".room");

        if ($thisCell.hasClass("is-collapsed")) {
            $cell.not($thisCell).removeClass("is-expanded").addClass("is-collapsed").addClass("is-inactive");
            $thisCell.removeClass("is-collapsed").addClass("is-expanded");

            if ($cell.not($thisCell).hasClass("is-inactive")) {
                //do nothing
            } else {
                $cell.not($thisCell).addClass("is-inactive");
            }

        } else {
            $thisCell.removeClass("is-expanded").addClass("is-collapsed");
            $cell.not($thisCell).removeClass("is-inactive");
        }
    });

    //close card when click on cross
    $cell.on("click", ".js-collapser", function () {
        const $thisCell = $(this).closest(".room");
        $thisCell.removeClass("is-expanded").addClass("is-collapsed");
        $cell.not($thisCell).removeClass("is-inactive");

    });

    $cell.on("click", ".join", async function () {
        console.log("hi");
        const id = $(this).closest(".room").attr("id");
        const token = window.localStorage.getItem("token");
        const data = {
            roomId: id,
            token
        };
        const res = await app.fetchData("/api/1.0/room/user", data, "POST");
        if(res.error){
            alert(res.error);
            return;
        }

        window.location.href = "/editor/" + id;
    });
};

app.roomTempGen = (room) => {
    return `<div id="${room.id}" class="room is-collapsed">
        <div class="room__inner js-expander">
            <i class="fa fa-folder-o"></i>
            <span>${room.name}</span>
        </div>
        <div class="room__expander">
            <div class="line">
                <label class="line-first">name: </label>
                <span class="line-second">${room.name}</span>
            </div>
            <div class="line">
                <label class="line-first">filename: </label>
                <span class="line-second">${room.fileName}</span>
            </div>
            <div class="line">
                <label class="line-first">creator: </label>
                <span class="line-second">${room.username}</span>
            </div>
            <div class="line">
                <label class="line-first">intro: </label>
            </div>
            <div class="line intro">No Comment</div>
            <button class="join">join</button>
        </div>
    </div>`;
};

app.renderRoom = async() => {
    const token = window.localStorage.getItem("token");
    const headers = {
        authorization: "Bearer " + token,
    };
    const res = await fetch("/api/1.0/room/all", {headers, method: "GET"}).then(res => res.json());
    const { data: rooms } = res;
    for(let room of rooms){
        const roomDiv = app.roomTempGen(room);
        $("#publicRooms .rooms").append(roomDiv);
    }
};

$(document).ready(app.init);