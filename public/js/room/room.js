/* global $ Swal filterXSS app */
app.init = async () => {
    app.paging = {
        public: 0,
        my: 0,
        in: 0
    };
    await app.checkToken();
    await app.initRender();
    if (app.username === 'kilem') {
        app.setDefaultForTest();
    }
    app.inviteCheck();
    app.UIListen();
};

app.initRender = async () => {
    const publicRooms = app.renderRooms('public', 0);
    const myRooms = app.renderRooms('my', 0);
    const inRooms = app.renderRooms('in', 0);
    app.topNavRender();
    await Promise.all([publicRooms, myRooms, inRooms]);
};


app.UIListen = () => {
    app.topNavListen();
    app.roomListen();
    app.pagingListen();
    app.createRoomListen();
    app.editRoomListen();
    app.searchListen();
};

app.setDefaultForTest = () => {
    const rooms = $('.rooms');
    const thisRoom = $('#inRooms').find('.room').get(0);
    const $thisRoom = $(thisRoom);
    if ($thisRoom.hasClass('is-collapsed')) {
        rooms.not($thisRoom).removeClass('is-expanded').addClass('is-collapsed').addClass('is-inactive');
        $thisRoom.removeClass('is-collapsed').removeClass('is-inactive').addClass('is-expanded');
        if (!rooms.not($thisRoom).hasClass('is-inactive')) {
            rooms.not($thisRoom).addClass('is-inactive');
        }
    } else {
        $thisRoom.removeClass('is-expanded').addClass('is-collapsed');
        rooms.not($thisRoom).removeClass('is-inactive');
    }
    $('body').animate({
        scrollTop: 880
    }, 1000);
};

app.createRoomListen = () => {
    $(document).on('change', '.swal2-checkbox input[type="checkbox"]', function () {
        if (this.checked) {
            $('#createPassword').removeClass('hidden');
            return;
        }
        $('#createPassword').addClass('hidden');
    });
    $('#createRoomButton').click(async function () {
        const swalRes = await Swal.fire({
            title: 'Create Room',
            html: `
                <br>
                <label>name</label><input type="text" id="name" class="swal2-input" maxlength="15" autocomplete="off"></input>
                <label>filename</label><input type="text" id="filename" class="swal2-input" maxlength="15" autocomplete="off"></input>
                <label for="swal2-checkbox" class="swal2-checkbox" style="display: flex;justify-content:flex-start;">
                    <input type="checkbox"  style="margin-left: 0;"></input>
                    <span class="swal2-label">isPrivate</span>
                </label>
                <div id="createPassword" class="hidden">
                    <label>password</label>
                    <input type="password" id="password" class="swal2-input" maxlength="15" autocomplete="off"></input>
                </div>
                <label>intro</label><textarea id="intro" class="swal2-textarea"></textarea>
                `,
            showCancelButton: true,
            confirmButtonText: 'Create',
            preConfirm: () => {
                const target = Swal.getPopup();
                const name = $(target).find('#name').val();
                const filename = $(target).find('#filename').val();
                const isPrivate = $(target).find('.swal2-checkbox input[type="checkbox"]').prop('checked');
                const intro = $(target).find('#intro').val();
                if (!name || !filename) {
                    app.errorShow('All fields are required');
                    return;
                }
                const room = {
                    name,
                    filename,
                    isPrivate,
                    intro
                };
                if (isPrivate) {
                    room.password = $(target).find('#password').val();
                }
                return app.fetchData('/api/1.0/room', {
                    room
                }, 'POST');
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
        addData.roomId = createRes.roomId;
        const addRes = await app.fetchData('/api/1.0/room/user', addData, 'POST');
        if (addRes.error) {
            app.errorShow(addRes.error);
            return;
        }
        window.location.href = '/editor/' + createRes.roomId;
    });
};

app.roomListen = () => {
    const rooms = $('.rooms');
    // open and close card when clicked on card
    rooms.on('click', '.js-expander', function () {
        const cell = $('.room');
        const thisCell = $(this).closest('.room');
        if (thisCell.hasClass('is-collapsed')) {
            cell.not(thisCell).removeClass('is-expanded').addClass('is-collapsed').addClass('is-inactive');
            thisCell.removeClass('is-collapsed').removeClass('is-inactive').addClass('is-expanded');
            if (!cell.not(thisCell).hasClass('is-inactive')) {
                cell.not(thisCell).addClass('is-inactive');
            }
        } else {
            thisCell.removeClass('is-expanded').addClass('is-collapsed');
            cell.not(thisCell).removeClass('is-inactive');
        }
    });


    rooms.on('click', '.join', function () {
        const id = $(this).closest('.room').attr('id');
        window.history.replaceState(null, null, '?invite=' + id);
        app.inviteCheck();
    });

    rooms.on('click', '.enter', function () {
        const id = $(this).closest('.room').attr('id');
        window.history.replaceState(null, null, '?invite=' + id);
        window.location.href = '/editor/' + id;
    });

    rooms.on('click', '.delete', async function () {
        const swal = await Swal.fire({
            icon: 'warning',
            title: 'Remove room?',
            showCancelButton: true
        });
        if (swal.isDismissed) {
            return;
        }
        const id = $(this).closest('.room').attr('id');

        const room = {
            roomId: id
        };
        const res = await app.fetchData('/api/1.0/room', room, 'DELETE');
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        $(this).closest('.room').remove();
        app.renderRooms('my', 0);
        app.renderRooms('public', 0);
        $('.room').removeClass('is-inactive');
    });

    rooms.on('click', '.exit', async function () {
        const swal = await Swal.fire({
            icon: 'warning',
            title: 'Exit room?',
            showCancelButton: true
        });
        if (swal.isDismissed) {
            return;
        }
        const id = $(this).closest('.room').attr('id');
        const room = {
            roomId: id
        };
        const res = await app.fetchData('/api/1.0/room/user', room, 'DELETE');
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        $(this).closest('.room').remove();
        app.renderRooms('in', 0);
        $('.room').removeClass('is-inactive');
    });
};

app.inviteCheck = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('invite')) {
        return;
    }
    const id = urlParams.get('invite');
    const getRes = await app.fetchData('/api/1.0/room/' + id);
    if (getRes.error) {
        app.errorShow(getRes.error);
        window.history.replaceState(null, null, window.location.pathname);
        return;
    }
    const isPrivate = getRes.rooms[0].password;
    const room = {
        roomId: id,

    };
    let res;
    if (isPrivate) {
        let swalConfig = {
            title: 'Join Room?',
            showCancelButton: true,
            confirmButtonText: 'Join',
            html: '<br><label>password</div><input id="password" type="password" class="swal2-input"></input>'
        };
        swalConfig.preConfirm = () => {
            const target = Swal.getPopup();
            const password = $(target).find('#password').val();
            room.password = password;
            return app.fetchData('/api/1.0/room/user', room, 'POST');
        };
        const swalRes = await Swal.fire(swalConfig);

        if (swalRes.isDismissed) {
            window.history.replaceState(null, null, window.location.pathname);
            return;
        }
        res = swalRes.value;
    }
    res = await app.fetchData('/api/1.0/room/user', room, 'POST');

    if (res.error) {
        app.errorShow(res.error);
        window.history.replaceState(null, null, window.location.pathname);
        return;
    }
    window.location.href = '/editor/' + id;
};

app.pagingListen = () => {
    const rooms = $('.rooms');
    rooms.on('click', '.next', function () {
        const id = $(this).closest('section').attr('id');
        let type = '';
        if (id === 'publicRooms') {
            type = 'public';
        }
        else if (id === 'myRooms') {
            type = 'my';
        }
        else {
            type = 'in';
        }
        app.renderRooms(type, ++app.paging[type]);
    });
    rooms.on('click', '.previous', function () {
        const id = $(this).closest('section').attr('id');
        let type = '';
        if (id === 'publicRooms') {
            type = 'public';
        }
        else if (id === 'myRooms') {
            type = 'my';
        }
        else {
            type = 'in';
        }
        app.renderRooms(type, --app.paging[type]);
    });
};

app.editRoomListen = () => {
    $('#myRooms').on('dblclick', '.room__expander', async function () {
        const id = $(this).closest('.room').attr('id');
        let username = $(this).find('.line-username').text();
        let name = $(this).find('.line-name').text();
        let filename = $(this).find('.line-filename').text();
        let intro = $(this).find('.line-intro').html();
        const swalRes = await Swal.fire({
            title: 'Edit Room Info',
            html: `
                <br>
                <label>name</label><input type="text" id="name" class="swal2-input" maxlength="15" value="${name}"></input>
                <label>filename</label><input type="text" id="filename" class="swal2-input" maxlength="15" value="${filename}"></input>
                <label>intro</label><textarea id="intro" style="resize: none;" class="swal2-textarea" wrap="hard" cols="10">${intro.split('<br>').join('\n')}</textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Edit',
            preConfirm: () => {
                const swal = Swal.getPopup();
                name = $(swal).find('#name').val();
                filename = $(swal).find('#filename').val();
                intro = $(swal).find('#intro').val();
                const room = {
                    id,
                    name,
                    intro
                };
                return app.fetchData('/api/1.0/room', room, 'PUT');
            }
        });
        if (swalRes.isDismissed) {
            return;
        }
        if (swalRes.value.error) {
            app.errorShow(swalRes.value.error);
            return;
        }
        app.successShow('Edited');
        const room = {
            id,
            filename,
            name,
            username,
            intro
        };
        const $newMy = app.genarateRoom(room, 'my');
        $(this).closest('.room').replaceWith($newMy);
        const $oldPublic = $('#publicRooms').find(`div#${id}`);
        if ($oldPublic.length === 1) {
            const $newPublic = app.genarateRoom(room, 'public');
            $oldPublic.replaceWith($newPublic);
        }
        $('.room').removeClass('is-inactive');
    });
};

app.genarateRoomTemp = (room) => {
    if (!room.intro) {
        room.intro = 'none';
    }
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
            <div class="line intro line-intro">${filterXSS(room.intro).split('\n').join('<br>')}</div>
            <div class="control">
            </div>
        </div>
    </div>`;
};

app.renderRooms = async (type, paging) => {
    const keyword = $('#search').val();
    let endpoint = `/api/1.0/room/${type}?paging=${paging}`;
    const isSearch = type === 'public' && keyword !== '';
    if (isSearch) {
        endpoint = `/api/1.0/room/search?paging=${paging}&keyword=${keyword}`;
    }
    const res = await app.fetchData(endpoint);
    const { rooms, next, previous } = res;
    const $typeRooms = $(`#${type}Rooms`);
    $typeRooms.find('.rooms .room').remove();
    const isNoRooms = rooms.length === 0;
    if (isNoRooms) {
        app.renderNoContent($typeRooms);
        return;
    }
    $typeRooms.find('.rooms .no-content').remove();
    $typeRooms.find('.next').removeClass('hidden');
    $typeRooms.find('.previous').removeClass('hidden');
    for (let room of rooms) {
        const $room = app.genarateRoom(room, type);
        $typeRooms.find('.rooms').append($room);
    }
    app.setPageButton($typeRooms, next, previous);

};

app.genarateRoom = (room, type) => {
    const $room = $(app.genarateRoomTemp(room));
    if (type === 'my') {
        const $enter = $('<button></button>').addClass('button').addClass('enter').text('enter');
        const $delete = $('<button></button>').addClass('button').addClass('delete').text('delete');
        $room.find('.control').append($enter, $delete);
    }
    else if (type === 'in') {
        const $enter = $('<button></button>').addClass('button').addClass('enter').text('enter');
        const $exit = $('<button></button>').addClass('button').addClass('exit').text('exit');
        $room.find('.control').append($enter, $exit);
    }
    else if (type === 'public') {
        const $join = $('<button></button>').addClass('button').addClass('join').text('join');
        $room.find('.control').append($join);
    }
    return $room;
};

app.setPageButton = ($typeRooms, next, previous) => {
    if (typeof previous === 'undefined') {
        $typeRooms.find('.previous').addClass('hidden');
    }
    else {
        $typeRooms.find('.previous').removeClass('hidden');
    }

    if (typeof next === 'undefined') {
        $typeRooms.find('.next').addClass('hidden');
    }
    else {
        $typeRooms.find('.next').removeClass('hidden');
    }
};

app.renderNoContent = ($typeRooms) => {
    $typeRooms.find('.next').addClass('hidden');
    $typeRooms.find('.previous').addClass('hidden');
    const isNoContent = $typeRooms.find('.no-content').length === 0;
    if (isNoContent) {
        $typeRooms.find('.rooms').append('<div class="no-content">No Content</div>');
    }
};

app.searchListen = () => {
    $('#search').change(function () {
        app.renderRooms('public', 0);
    });
};

$(document).ready(app.init);