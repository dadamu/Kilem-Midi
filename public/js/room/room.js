/* global $ Swal filterXSS */
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
    app.editRoomListen();
    app.searchListen();
};

app.createRoomListen = () => {
    $(document).on("change").on("change", ".swal2-checkbox input[type='checkbox']", function(){
        if(this.checked){
            $("#createPassword").removeClass("hidden");
            return;
        }
        $("#createPassword").addClass("hidden");
    });
    $("#createRoomButton").click(async function () {
        const token = window.localStorage.getItem("token");
        const swalRes = await Swal.fire({
            title: "Create Room",
            html: `
                <br>
                <label>name</label><input type='text' id='name' class='swal2-input' maxlength='10' autocomplete='off'></input>
                <label>filename</label><input type='text' id='filename' class='swal2-input' maxlength='10' autocomplete='off'></input>
                <label for='swal2-checkbox' class='swal2-checkbox' style='display: flex;justify-content:flex-start;'>
                    <input type='checkbox'  style='margin-left: 0;'></input>
                    <span class='swal2-label'>isPrivate</span>
                </label>
                <div id='createPassword' class='hidden'>
                    <label>password</label>
                    <input type='password' id='password' class='swal2-input' maxlength='10' autocomplete='off'></input>
                </div>
                <label>intro</label><textarea id='intro' class='swal2-textarea'></textarea>`,
            showCancelButton: true,
            confirmButtonText: "Create",
            preConfirm: () => {
                const target = Swal.getPopup();
                const name = $(target).find("#name").val();
                const filename = $(target).find("#filename").val();
                const isPrivate = $(target).find(".swal2-checkbox input[type='checkbox']").prop("checked");
                const intro = $(target).find("#intro").val();
                if (!name || !filename) {
                    app.errorShow("Please fill name and filename field");
                    return;
                }
                const room = {
                    name,
                    filename,
                    isPrivate,
                    intro
                };
                if (isPrivate) {
                    room.password = $(target).find("#password").val();
                }
                return app.fetchData("/api/1.0/room", {
                    room,
                    token
                }, "POST");
            }
        });
        if (swalRes.isDismissed) {
            return;
        }
        const createRes = swalRes.value;
        if (createRes.error) {
            app.errorShow(createRes.error);
            return;
        }
        const addData = {};
        addData.token = token;
        addData.roomId = createRes.roomId;
        const addRes = await app.fetchData("/api/1.0/room/user", addData, "POST");
        if (addRes.error) {
            app.errorShow(addRes.error);
            return;
        }
        window.location.href = "/editor/" + createRes.roomId;
    });
};

app.roomListen = () => {
    const rooms = $(".rooms");
    // open and close card when clicked on card
    rooms.on("click", ".js-expander", function () {
        const cell = $(".room");
        const thisCell = $(this).closest(".room");
        if (thisCell.hasClass("is-collapsed")) {
            cell.not(thisCell).removeClass("is-expanded").addClass("is-collapsed").addClass("is-inactive");
            thisCell.removeClass("is-collapsed").removeClass("is-inactive").addClass("is-expanded");

            if (cell.not(thisCell).hasClass("is-inactive")) {
                // do nothing
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

    rooms.on("click", ".enter", function () {
        const id = $(this).closest(".room").attr("id");
        window.history.replaceState(null, null, "?invite=" + id);
        window.location.href = "/editor/" + id;
    });

    rooms.on("click", ".delete", async function () {
        const swal = await Swal.fire({
            icon: "warning",
            title: "Remove room?",
            showCancelButton: true
        });
        if (swal.isDismissed) {
            return;
        }
        const id = $(this).closest(".room").attr("id");
        const token = window.localStorage.getItem("token");
        const data = {
            roomId: id,
            token
        };
        const res = await app.fetchData("/api/1.0/room", data, "DELETE");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        $(this).closest(".room").remove();
        app.renderRoom("my", 0);
        app.renderRoom("public", 0);
    });

    rooms.on("click", ".exit", async function () {
        const swal = await Swal.fire({
            icon: "warning",
            title: "Exit room?",
            showCancelButton: true
        });
        if (swal.isDismissed) {
            return;
        }
        const id = $(this).closest(".room").attr("id");
        const token = window.localStorage.getItem("token");
        const data = {
            roomId: id,
            token
        };
        const res = await app.fetchData("/api/1.0/room/user", data, "DELETE");
        if (res.error) {
            app.errorShow(res.error);
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
    const getRes = await fetch("/api/1.0/room/" + id, {
        headers,
        method: "GET"
    }).then(res => res.json());
    if (getRes.error) {
        app.errorShow(getRes.error);
        window.history.replaceState(null, null, window.location.pathname);
        return;
    }
    const isPrivate = getRes.data[0].password;
    const data = {
        roomId: id,
        token
    };

    let res;
    if (isPrivate) {
        let swalConfig = {
            title: "Join Room?",
            showCancelButton: true,
            confirmButtonText: "Join",
            html: "<br><label>password</div><input id='password' type='password' class='swal2-input'></input>"
        };
        swalConfig.preConfirm = () => {
            const target = Swal.getPopup();
            const password = $(target).find("#password").val();
            data.password = password;
            return app.fetchData("/api/1.0/room/user", data, "POST");
        };
        const swalRes = await Swal.fire(swalConfig);

        if (swalRes.isDismissed) {
            window.history.replaceState(null, null, window.location.pathname);
            return;
        }
        res = swalRes.value;
    }
    res = await app.fetchData("/api/1.0/room/user", data, "POST");

    if (res.error) {
        app.errorShow(res.error);
        window.history.replaceState(null, null, window.location.pathname);
        return;
    }
    window.location.href = "/editor/" + id;
};

app.pagingListen = () => {
    const rooms = $(".rooms");
    rooms.on("click", ".next", function () {
        const id = $(this).closest("section").attr("id");
        let type = "";
        if (id === "publicRooms") {
            type = "public";
        }
        else if (id === "myRooms") {
            type = "my";
        }
        else {
            type = "in";
        }
        app.renderRoom(type, ++app.paging.public);
    });
    rooms.on("click", ".previous", function () {
        const id = $(this).closest("section").attr("id");
        let type = "";
        if (id === "publicRooms") {
            type = "public";
        }
        else if (id === "myRooms") {
            type = "my";
        }
        else {
            type = "in";
        }
        app.renderRoom(type, --app.paging.public);
    });
};

app.editRoomListen = () => {
    $("#myRooms").on("dblclick", ".room__expander", async function () {
        const id = $(this).closest(".room").attr("id");
        let username = $(this).find(".line-username").text();
        let name = $(this).find(".line-name").text();
        let filename = $(this).find(".line-filename").text();
        let intro = $(this).find(".line-intro").html();
        const res = await Swal.fire({
            title: "Edit Room Info",
            html: `
                <br>
                <label>name</label><input type='text' id='name' class='swal2-input' maxlength='10' value='${name}'></input>
                <label>filename</label><input type='text' id='filename' class='swal2-input' maxlength='10' value='${filename}'></input>
                <label>intro</label><textarea id='intro' style='resize: none;' class='swal2-textarea' wrap="hard" cols='10'>${intro.split("<br>").join("\n")}</textarea>`,
            showCancelButton: true,
            confirmButtonText: "Edit",
            preConfirm: () => {
                name = Swal.getPopup().querySelector("#name").value;
                filename = Swal.getPopup().querySelector("#filename").value;
                intro = Swal.getPopup().querySelector("#intro").value;
                const data = {
                    id,
                    name,
                    intro
                };
                return app.fetchData("/api/1.0/room", data, "PUT");
            }
        });
        if (res.isDismissed) {
            return;
        }
        if (res.error) {
            app.errorShow(res.error);
        }
        app.successShow("Edited");
        const newRoom = app.roomTempGen({
            id,
            filename,
            name,
            username,
            intro
        });
        $(this).closest(".room").replaceWith(newRoom);
    });
};

app.roomTempGen = (room) => {
    return `<div id="${room.id}" class="room is-collapsed">
        <div class="room__inner js-expander">
            <i class="fa fa-folder-o"></i>
            <span>${filterXSS(room.name)}</span>
        </div>
        <div class="room__expander">
            <div class="line">
                <label class="line-first">name</label>
                <label class="colon">:</label>
                <span class="line-second line-name">${filterXSS(room.name)}</span>
            </div>
            <div class="line">
                <label class="line-first">filename</label>
                <label class="colon">:</label>
                <span class="line-second line-filename">${filterXSS(room.filename)}</span>
            </div>
            <div class="line">
                <label class="line-first">creator</label>
                <label class="colon">:</label>
                <span class="line-second line-username">${filterXSS(room.username)}</span>
            </div>
            <div class="line">
                <label class="line-first">intro: </label>
            </div>
            <div class="line intro line-intro">${filterXSS(room.intro).split("\n").join("<br>")}</div>
            <div class="control">
            </div>
        </div>
    </div>`;
};

app.renderRoom = async (type, paging) => {
    const keyword = $("#search").val();
    const token = window.localStorage.getItem("token");
    const headers = {
        authorization: "Bearer " + token,
    };
    let endpoint = `/api/1.0/room/${type}?paging=${paging}`;
    if (type === "public" && keyword !== "") {
        endpoint = `/api/1.0/room/search?paging=${paging}&keyword=${keyword}`;
    }
    const res = await fetch(endpoint, { headers, method: "GET" }).then(res => res.json());
    const { data: rooms, next, previous } = res;
    const typeRooms = `#${type}Rooms`;
    $(`${typeRooms} .rooms .room`).remove();
    if (rooms.length === 0) {
        $(`${typeRooms} .next`).addClass("hidden");
        $(`${typeRooms} .previous`).addClass("hidden");
        if ($(`${typeRooms} .rooms`).find(".no-content").length === 0) {
            $(`${typeRooms} .rooms`).append("<div class='no-content'>No Content</div>");
        }
        return;
    }
    $(`${typeRooms} .rooms .no-content`).remove();
    $(`${typeRooms} .next`).removeClass("hidden");
    $(`${typeRooms} .previous`).removeClass("hidden");
    for (let room of rooms) {
        const roomDiv = $(app.roomTempGen(room));
        if (type === "my") {
            const enterButton = $("<button></button>").addClass("button").addClass("enter").text("enter");
            const deleteButton = $("<button></button>").addClass("button").addClass("delete").text("delete");
            roomDiv.find(".control").append(enterButton, deleteButton);
        }
        if (type === "in") {
            const enterButton = $("<button></button>").addClass("button").addClass("enter").text("enter");
            const exitButton = $("<button></button>").addClass("button").addClass("exit").text("exit");
            roomDiv.find(".control").append(enterButton, exitButton);
        }
        if (type === "public") {
            const joinButton = $("<button></button>").addClass("button").addClass("join").text("join");
            roomDiv.find(".control").append(joinButton);
        }
        $(`${typeRooms} .rooms`).append(roomDiv);
    }
    if (typeof previous === "undefined") {
        $(`${typeRooms} .previous`).addClass("hidden");
    }
    else {
        $(`${typeRooms} .previous`).removeClass("hidden");
    }

    if (typeof next === "undefined") {
        $(`${typeRooms} .next`).addClass("hidden");
    }
    else {
        $(`${typeRooms} .next`).removeClass("hidden");
    }
    app.paging.type = paging;
};

app.searchListen = () => {
    $("#search").change(function () {
        app.renderRoom("public", 0);
    });
};

$(document).ready(app.init);