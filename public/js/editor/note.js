/* global $ app Note */
app.noteListen = () => {
    app.noteGridListen();
    app.noteLengthListen();
    app.addMidiNoteListen();
    app.noteDeleteListen();
    app.notSelectListen();
};

app.noteOutTrack = (trackId, note) => {
    app.music.getTrack(trackId).deleteNote(new Note(note.pitch, note.posX, note.length));
};

app.noteGridListen = () => {
    $('.midi-toolbox').on('click', '.note-grid', function () {
        $('.note-grid.selected').removeClass('selected');
        $(this).addClass('selected');
        app.noteGrid = $(this).attr('value');
    });
};

app.noteLengthListen = () => {
    $('.midi-toolbox').on('click', '.note-length', function () {
        $('.note-length.selected').removeClass('selected');
        $(this).addClass('selected');
        app.noteLength = $(this).attr('value');
    });
};

app.createNote = async (note) => {
    const { posX, pitch } = note;
    const trackId = app.getTrackId();

    const notes = app.music.getTrack(trackId).get('notes');
    const isDuplicated = notes[posX] && notes[posX].filter(midi => midi.pitch === pitch).length > 0;
    if (isDuplicated)
        return;

    const instrument = app.music.getTrack(trackId).get('instrument');
    app.playNote(instrument, pitch);
    const newNote = { posX, pitch, length: app.noteLength };
    const noteInfo = new NoteInfo('createNote', trackId, newNote);
    app.emit('noteUpdate', noteInfo);
    app.regionNoteRender(trackId, newNote);
    app.noteIntoTrack(trackId, newNote);
    app.createNoteRender(trackId, newNote);
};

app.notSelectListen = () => {
    $('#grids').on('click', '.note', async function () {
        const trackId = app.getTrackId();
        const { instrument } = app.music.tracks[trackId];
        app.playNote(instrument, $(this).attr('pitch'));
    });
};

app.noteDeleteListen = () => {
    $('#grids').on('dblclick', '.note', async function () {
        const trackId = app.getTrackId();
        const locker = app.music.getTrack(trackId).get('locker');
        const isOwner = parseInt(app.userId) === locker.id;
        if (!isOwner) {
            app.failedByLock();
            return;
        }
        const note = app.getNoteInfo(this);
        const noteInfo = new NoteInfo('deleteNote', trackId, note);
        app.emit('noteUpdate', noteInfo);
        app.noteOutTrack(trackId, note);
        app.deleteNoteRender(trackId, note);
    });
};

app.playNote = async (instrument, pitch) => {
    if (app.instruments[instrument].audio[pitch]) {
        const source = app.audioCtx.createBufferSource();
        const { buffer, pitchShift } = app.instruments[instrument].audio[pitch];
        source.buffer = buffer;
        if (pitchShift) {
            const pitchValue = 100;
            source.detune.value = pitchShift * pitchValue;
        }
        const duration = 0.5;
        app.fadeAudio(source, duration);
    }
};

app.svgToNote = (left, top) => {
    const height = app.pitchHeight * app.keysNum;
    let bottom = height - top;
    const posFromLeft = Math.floor(left / app.gridsInterval * app.MUSIC_RESOLUTION);
    const posFromBottom = Math.floor(bottom / app.pitchHeight);
    let posX = Math.floor(posFromLeft / (app.MUSIC_RESOLUTION * app.noteGrid)) * (app.MUSIC_RESOLUTION * app.noteGrid);
    let pitch = posFromBottom + app.minPitch;
    return { posX, pitch };
};

app.createNoteRender = (trackId, note) => {
    const panelId = app.getPanelId();
    if (panelId === trackId) {
        const noteDiv = app.createNoteDiv(note);
        const tailDiv = $('<div></div>').addClass('tail');
        noteDiv.append(tailDiv);
        $('#grids').append(noteDiv);
        app.setNoteDrag(noteDiv);
        app.setNoteEditWidth(tailDiv);
    }
};

app.createNoteDiv = (note) => {
    const interval = app.gridsInterval * note.length;
    const pitchHeight = app.pitchHeight;
    const left = note.posX * app.gridsInterval / app.MUSIC_RESOLUTION;
    const bottom = (note.pitch - app.minPitch) * pitchHeight;
    const noteDiv = $('<div></div>');
    noteDiv.addClass('note').width(interval).height(pitchHeight);
    noteDiv.css('left', left).css('bottom', bottom);
    noteDiv.attr('pitch', note.pitch);
    noteDiv.attr('length', note.length);
    noteDiv.attr('posX', note.posX);
    return noteDiv;
};

app.deleteNoteRender = (trackId, note) => {
    const panelId = app.getPanelId();
    $(`.region[trackId=${trackId}] div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
    if (panelId === trackId) {
        $(`#midiPanel div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
    }
};

app.dragNoteDeleteRender = (trackId, note) => {
    $(`.region[trackId=${trackId}] div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
};

app.noteIntoTrack = (trackId, note) => {
    app.music.getTrack(trackId).addNote(new Note(note.pitch, note.posX, note.length));
};

app.addMidiNoteListen = () => {
    $('#svgGrid').click(function (evt) {
        const trackId = app.getTrackId();
        const locker = app.music.getTrack(trackId).get('locker');
        const isOwner = parseInt(app.userId) === locker.id;
        if (!isOwner) {
            app.failedByLock();
            return;
        }
        const target = evt.target;
        const dim = target.getBoundingClientRect();
        const left = evt.clientX - dim.left;
        const top = evt.clientY - dim.top;
        const note = app.svgToNote(left, top);
        app.createNote(note);
    });
};

app.setNoteDrag = (noteDiv) => {
    noteDiv.draggable({
        cursor: 'move',
        start: function(evt) {
            this.trackId = app.getTrackId();
            const note = app.getNoteInfo(evt.target);
            this.oldNote = note;
            const noteInfo = new NoteInfo('deleteNote', this.trackId, note);
            app.emit('noteUpdate', noteInfo);
            app.noteOutTrack(this.trackId, note);
            app.dragNoteDeleteRender(this.trackId, note);
        },
        drag: function(evt, ui) {
            const top = evt.pageY + $('#grids').scrollTop() - $('#grids').offset().top;
            const left = evt.pageX + $('#grids').scrollLeft() - $('#grids').offset().left - $(evt.target).attr('length') / 2 * app.gridsInterval;
            const alignPos = app.convertNotePos(left, top, this.oldNote.length);
            ui.position = { top: alignPos.top, left: alignPos.left };
        },
        stop: function(evt){
            const endTop = app.pxToNum($(evt.target).css('top')) + 1;
            const endLeft = app.pxToNum($(evt.target).css('left'));
            const newNote = app.svgToNote(endLeft, endTop);
            const { pitch: originalPitch } = newNote;

            const length = parseFloat($(evt.target).attr('length'));
            newNote.length = length;
            $(evt.target).attr('posX', newNote.posX).attr('pitch', newNote.pitch);
            const originalNotes = app.music.getTrack(this.trackId).get('notes');
            const notesOnPosX = originalNotes[newNote.posX];
            let isDuplicated = notesOnPosX && notesOnPosX.filter(midi => midi.pitch === newNote.pitch).length > 0;
            while (isDuplicated) {
                newNote.pitch += 1;
                const top = endTop - app.pitchHeight * (newNote.pitch - originalPitch);
                $(evt.target).css('top', top).attr('pitch', newNote.pitch);
                if (top < 0) {
                    $(evt.target).remove();
                    return;
                }
                isDuplicated = notesOnPosX && notesOnPosX.filter(midi => midi.pitch === newNote.pitch).length > 0;
            }

            const { instrument } = app.music.tracks[this.trackId];
            app.playNote(instrument, newNote.pitch);
            const noteInfo = new NoteInfo('createNote', this.trackId, newNote);
            app.emit('noteUpdate', noteInfo);
            app.regionNoteRender(this.trackId, newNote);
            app.noteIntoTrack(this.trackId, newNote);
        }
    });
};

app.convertNotePos = (left, top, length) => {
    const resolution = app.gridsInterval * app.noteLength;
    let aligntop = Math.round(top / app.pitchHeight) * app.pitchHeight;
    let alignLeft = Math.round(left / resolution) * resolution;
    if (aligntop < 0) {
        aligntop = 0;
    }

    if (aligntop > app.keysNum * app.pitchHeight) {
        aligntop = (app.keysNum - 1) * app.pitchHeight;
    }

    if (alignLeft < 0) {
        alignLeft = 0;
    }

    if (alignLeft > app.musicLength * app.gridsInterval) {
        alignLeft = Math.floor((app.musicLength - length) / app.noteGrid) * app.noteGrid * app.gridsInterval;
    }
    return {
        top: aligntop,
        left: alignLeft
    };
};


app.setNoteEditWidth = (tailDiv) => {
    tailDiv.draggable({
        start: (evt) => {
            const trackId = app.getTrackId();
            const note = app.getNoteInfo($(evt.target).parent());
            const noteInfo = new NoteInfo('deleteNote', trackId, note);
            app.emit('noteUpdate', noteInfo);
            app.noteOutTrack(trackId, note);
            app.dragNoteDeleteRender(trackId, note);
        },
        drag: (evt, ui) => {
            const { left } = ui.position;
            const $noteDiv = $(evt.target).parent();
            const resolution = app.gridsInterval * app.noteGrid;
            const tailWidth = 10;
            const posChange = parseInt(Math.round((left + tailWidth) / resolution)) * resolution;
            if (posChange <= 0) {
                $noteDiv.width(resolution);
                return;
            }
            $noteDiv.width(posChange);
        },
        stop: (evt) => {
            const $noteDiv = $(evt.target).parent();
            const width = $noteDiv.width();
            const tailWidth = 10;
            $(evt.target).css('left', width - tailWidth).css('top', 0);
            const length = width / app.gridsInterval;
            $noteDiv.attr('length', length);
            const newNote = app.getNoteInfo($noteDiv);
            const trackId = $('#midiPanel').attr('trackId');
            const instrument = app.music.getTrack(trackId).get('instrument');
            app.playNote(instrument, newNote.pitch);
            const noteInfo = new NoteInfo('createNote', trackId, newNote);
            app.emit('noteUpdate', noteInfo);
            app.regionNoteRender(trackId, newNote);
            app.noteIntoTrack(trackId, newNote);
        }
    });
};

app.getNoteInfo = (noteDiv) => {
    const posX = parseInt($(noteDiv).attr('posX'));
    const pitch = parseInt($(noteDiv).attr('pitch'));
    const length = parseFloat($(noteDiv).attr('length'));
    return { posX, pitch, length };
};

app.notesRender = (notes) => {
    for (let note of notes) {
        const noteDiv = app.createNoteDiv(note);
        const tailDiv = $('<div></div>').addClass('tail');
        noteDiv.append(tailDiv);
        $('#grids').append(noteDiv);
        const trackId = app.getTrackId();
        const locker = app.music.getTrack(trackId).get('locker');
        if (parseInt(app.userId) === locker.id) {
            app.setNoteDrag(noteDiv);
            app.setNoteEditWidth(tailDiv);
        }
    }
};


class NoteInfo{
    constructor(type, trackId, note){
        this.userId = app.userId;
        this.roomId = app.roomId;
        this.type = type;
        this.trackId = trackId;
        this.note = note;
    }
}