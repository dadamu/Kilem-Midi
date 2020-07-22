/* global $ */
const app = {};

app.init = async () => {
    app.paging = {
        public: 0,
        mine: 0,
        in: 0
    };
    await app.checkToken();
    await app.initRender();
    app.inviteCheck();
    app.UIListen();
};

app.initRender = async () => {
    const publicRooms = app.renderRoom("public", 0);
    const myRooms = app.renderRoom("my", 0);
    const inRooms = app.renderRoom("in", 0);
    app.topNavRender();
    await Promise.all([publicRooms, myRooms, inRooms]);
    return;
};


app.UIListen = () => {
    app.topNavListen();
    app.roomListen();
    app.pagingListen();
    app.createRoomListen();
};

app.createRoomListen = () => {
    $("#createRoomButton").click(async function () {
        const createData = {};
        const room = {};
        room.name = $(".create-room input[name='name']").val();
        room.filename = $(".create-room input[name='filename']").val();
        room.isPrivate = $(".create-room input[name='is_private']").prop("checked");
        if (room.isPrivate) {
            room.password = $(".create-room input[name='password']").val();
        }
        room.intro = $(".create-room textarea[name='intro']").val();
        createData.room = room;
        createData.token = window.localStorage.getItem("token");
        const createRes = await app.fetchData("/api/1.0/room", createData, "POST");
        if (createRes.error) {
            alert(createRes.error);
            return;
        }
        const addData = {};
        addData.token = window.localStorage.getItem("token");
        addData.roomId = createRes.roomId;
        const addRes = await app.fetchData("/api/1.0/room/user", addData, "POST");
        if (addRes.error) {
            alert(addRes.error);
            return;
        }
        window.location.href = "/editor/" + createRes.roomId;
    });
};

app.roomListen = () => {
    const rooms = $(".rooms");
    //open and close card when clicked on card
    rooms.on("click", ".js-expander", function () {
        const cell = $(".room");
        const thisCell = $(this).closest(".room");
        if (thisCell.hasClass("is-collapsed")) {
            cell.not(thisCell).removeClass("is-expanded").addClass("is-collapsed").addClass("is-inactive");
            thisCell.removeClass("is-collapsed").removeClass("is-inactive").addClass("is-expanded");

            if (cell.not(thisCell).hasClass("is-inactive")) {
                //do nothing
            } else {
                cell.not(thisCell).addClass("is-inactive");
            }

        } else {
            thisCell.removeClass("is-expanded").addClass("is-collapsed");
            cell.not(thisCell).removeClass("is-inactive");
        }
    });

    //close card when click on cross
    rooms.on("click", ".js-collapser", function () {
        const cell = $(".room");
        const thisCell = $(this).closest(".room");
        thisCell.removeClass("is-expanded").addClass("is-collapsed");
        cell.not(thisCell).removeClass("is-inactive");
    });

    rooms.on("click", ".join", function () {
        const id = $(this).closest(".room").attr("id");
        window.history.replaceState(null, null, "?invite=" + id);
        app.inviteCheck();
    });

    rooms.on("click", ".delete", async function () {
        const deleteCheck = confirm("delete confirm");
        if(!deleteCheck){
            return;
        }
        const id = $(this).closest(".room").attr("id");
        const token = window.localStorage.getItem("token");
        const data = {
            roomId: id,
            token
        };
        const res = await app.fetchData("/api/1.0/room", data, "DELETE");
        if(res.error){
            alert(res.error);
            return;
        }
        $(this).closest(".room").remove();
        app.renderRoom("my", 0);
        app.renderRoom("public", 0);
    });

    rooms.on("click", ".exit", async function () {
        const exitCheck = confirm("exit confirm");
        if(!exitCheck){
            return;
        }
        const id = $(this).closest(".room").attr("id");
        const token = window.localStorage.getItem("token");
        const data = {
            roomId: id,
            token
        };
        const res = await app.fetchData("/api/1.0/room/user", data, "DELETE");
        if(res.error){
            alert(res.error);
            return;
        }
        $(this).closest(".room").remove();
        app.renderRoom("in", 0);
    });
};

app.inviteCheck = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("invite")) {
        return;
    }
    const token = window.localStorage.getItem("token");
    const id = urlParams.get("invite");
    const headers = {
        authorization: "Bearer " + token,
    };
    const getRes = await fetch("/api/1.0/room/"+id, {
        headers,
        method: "GET"
    }).then(res => res.json());
    if(getRes.error){
        alert(getRes.error);
        window.history.replaceState(null, null, window.location.pathname);
        return;
    }
    const check = confirm("Join?");
    if (!check) {
        window.history.replaceState(null, null, window.location.pathname);
        return;
    }
    const data = {
        roomId: id,
        token
    };
    if(getRes.data[0].password){
        data.password = prompt("input password");
    }
    const res = await app.fetchData("/api/1.0/room/user", data, "POST");
    if (res.error) {
        alert(res.error);
        return;
    }
    window.location.href = "/editor/" + id;
};

app.pagingListen = () => {
    const section = $("section");
    section.on("click", ".next", function () {
        const id = $(this).closest("section").attr("id");
        let type = "";
        if (id === "publicRooms") {
            type = "public";
        }
        else if(id === "myRooms"){
            type = "my";
        }
        else{
            type = "in";
        }
        app.renderRoom(type, ++app.paging.public);
    });
    section.on("click", ".previous", function () {
        const id = $(this).closest("section").attr("id");
        let type = "";
        if (id === "publicRooms") {
            type = "public";
        }
        else if(id === "myRooms"){
            type = "my";
        }
        else{
            type = "in";
        }
        app.renderRoom(type, --app.paging.public);
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
                <span class="line-second">${room.filename}</span>
            </div>
            <div class="line">
                <label class="line-first">creator: </label>
                <span class="line-second">${room.username}</span>
            </div>
            <div class="line">
                <label class="line-first">intro: </label>
            </div>
            <div class="line intro">${room.intro}</div>
            <div class="control">
                <button class="button join">join</button>
            </div>
        </div>
    </div>`;
};

app.renderRoom = async (type, paging) => {
    const token = window.localStorage.getItem("token");
    const headers = {
        authorization: "Bearer " + token,
    };
    const res = await fetch(`/api/1.0/room/${type}?paging=${paging}`, { headers, method: "GET" }).then(res => res.json());
    const { data: rooms, next, previous } = res;
    $(`#${type}Rooms .rooms .room`).remove();
    if (rooms.length === 0) {
        $(`#${type}Rooms .rooms`).html("No Content");
        $(`#${type}Rooms .next`).addClass("hidden");
        $(`#${type}Rooms .previous`).addClass("hidden");
        return;
    }
    for (let room of rooms) {
        const roomDiv = $(app.roomTempGen(room));
        if(type === "my"){
            const deleteButton = $("<button></button>").addClass("button").addClass("delete").text("delete");
            roomDiv.find(".control").append(deleteButton);
        }
        if(type === "in"){
            const exitButton = $("<button></button>").addClass("button").addClass("exit").text("exit");
            roomDiv.find(".control").append(exitButton);
        }
        $(`#${type}Rooms .rooms`).append(roomDiv);
    }
    if (typeof previous === "undefined") {
        $(`#${type}Rooms .previous`).addClass("hidden");
    }
    else {
        $(`#${type}Rooms .previous`).removeClass("hidden");
    }

    if (typeof next === "undefined") {
        $(`#${type}Rooms .next`).addClass("hidden");
    }
    else {
        $(`#${type}Rooms .next`).removeClass("hidden");
    }
};

$(document).ready(app.init);