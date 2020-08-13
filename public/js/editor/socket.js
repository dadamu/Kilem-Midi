/* global app io Track $ */
app.on = (event, callback) => {
    app.socket.on(event, callback);
};

app.emit = async (event, Obj) => {
    app.socket.emit(event, Obj);
};

app.socketInit = async () => {
    app.socket = io('/room' + app.roomId);
    await app.ioListen();
};

app.ioListen = async () => {
    app.on('connect', ()=> {
        app.emit('init', { token: window.localStorage.getItem('token') });
    });
    app.on('addTrack', (track) => {
        const { id, name, instrument, locker } = track;
        app.music.addTrack(new Track(id, name, instrument));
        app.music.getTrack(id).set('locker', locker);
        app.addTrackRender(id, name);
        app.saveFile();
        app.successShow('Track added');
    });
    app.on('commit', (data) => {
        const { track } = data;
        app.music.setTrack(track);
        app.addVersionOption(track);
        const isSelected = app.getTrack === track.id;
        if (isSelected) {
            app.panelLoadRender(track.id);
        }
        app.loadRegionNotesRender(track.id);
        app.saveFile();
        app.successShow('New version saved');
    });
    app.on('deleteTrack', (data) => {
        const { track } = data;
        const selectedTrack = $(`.track.track-${track.id}`);
        app.music.deleteTrack(track.id);
        selectedTrack.remove();
        $(`.region.track-${track.id}`).remove();
        $('.track').first().addClass('selected');
        $('.region').first().addClass('selected');
        app.panelLoadRender($('.region').last().attr('trackId'));
        app.saveFile();
        if (parseInt($('#midiPanel').attr('trackId')) === parseInt(track.id)) {
            $('#midiPanel').addClass('hidden');
            $('#midiPanelButton').css('background', 'inherit');
            app.isMidiEditorOpen = false;
        }
        
    });

    app.on('lock', (data) => {
        const { track } = data;
        app.music.getTrack(track.id).set('locker', track.locker);
        $(`.track.track-${track.id} .track-lock`).html(app.lockerRender(track.locker).html());
        if (track.locker.id === app.userId) {
            $(`.track.track-${track.id} .track-name`).addClass('editable').removeAttr('disabled');
        }
        else {
            $(`.track.track-${track.id} .track-name`).removeClass('editable').attr('disabled', true);
        }
        const isSelected = app.getTrackId() === track.id;
        if (isSelected) {
            app.panelLoadRender(track.id);
        }
        app.saveFile();
    });

    app.on('trackNameChange', (track) => {
        app.music.getTrack(track.id).set('name', track.name);
        $(`.track.track-${track.id} .track-name`).val(track.name);
    });

    app.on('chat', (data) => {
        const { chat } = data;
        app.chatRender(chat);
        if ($('#chatRoom').hasClass('hidden')) {
            $('#chatButton').addClass('notify');
        }
    });

    app.on('createNote', (data) => {
        const { note, trackId } = data;
        app.createNoteRender(trackId, note);
        app.regionNoteRender(trackId, note);
        app.noteIntoTrack(trackId, note);
    });

    app.on('deleteNote', (data) => {
        const { note, trackId } = data;
        app.deleteNoteRender(trackId, note);
        app.regionNoteDelete(trackId, note);
        app.noteOutTrack(trackId, note);
    });

    app.on('instrumentSet', (data) => {
        const { track } = data;
        app.music.getTrack(track.id).set('instrument', track.instrument);
        $(`.track.track-${track.id} .instrument-selector`).val(track.instrument);
        if (parseInt($('#midiPanel').attr('trackId')) === parseInt(track.id)) {
            app.activeKeyRender(track.instrument);
        }
    });

    app.on('filenameChange', (data) => {
        const { filename } = data;
        app.filename = filename;
        app.filenameRender(filename);
    });

    app.on('bpmChange', async (data) => {
        const { bpm } = data;
        const oldBpm = app.music.get('bpm');
        app.music.set('bpm', bpm);
        app.bpmRender(bpm);

        app.loopend = app.loopend * oldBpm / bpm;
        app.loopstart = app.loopstart * oldBpm / bpm;
        if (app.isplaying) {
            app.currentTime = app.currentTime * oldBpm / bpm;
            clearInterval(app.playInterval);
            app.isplaying = false;
            app.successShow('Bpm changed');
            app.midiPlay();
        }
    });

    app.on('kilemError', async(data) => {
        const { error } = data;
        app.errorShow(error);
    });
};