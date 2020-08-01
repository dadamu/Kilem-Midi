/* global $ app Note */
app.noteOutTrack = (trackId, note) => {
    app.music.tracks[trackId].deleteNote(new Note(note.pitch, note.posX, 1));
};

app.noteGridListen = () => {
    $(".midi-toolbox").on("click", ".note-grid", function () {
        $(".note-grid.selected").removeClass("selected");
        $(this).addClass("selected");
        app.noteGrid = $(this).attr("value");
    });
};

app.noteLengthListen = () => {
    $(".midi-toolbox").on("click", ".note-length", function () {
        $(".note-length.selected").removeClass("selected");
        $(this).addClass("selected");
        app.noteLength = $(this).attr("value");
    });
};

app.createNote = async (note) => {
    const { posX, pitch } = note;
    const trackId = $("#midiPanel").attr("trackId");

    //ignore duplicate not at same pos
    if (app.music.tracks[trackId].notes[posX] && app.music.tracks[trackId].notes[posX].filter(midi => midi.pitch === pitch).length > 0)
        return;
    const { instrument } = app.music.tracks[trackId];
    app.playNote(instrument, pitch);
    const data = {
        type: "createNote",
        userId: app.userId,
        roomId: app.roomId,
        trackId,
        note: { posX, pitch, length: app.noteLength }
    };
    app.emit("noteUpdate", data);
    const newNote = { posX, pitch, length: app.noteLength };
    app.regionNoteRender(trackId, newNote);
    app.noteIntoTrack(trackId, newNote);
    app.createNoteRender(trackId, newNote);
};

app.notSelectListen = () => {
    $("#grids").on("click", ".note", async function () {
        const trackId = $("#midiPanel").attr("trackId");
        const { instrument } = app.music.tracks[trackId];
        app.playNote(instrument, $(this).attr("pitch"));
    });
};

app.noteDeleteListen = () => {
    $("#grids").on("dblclick", ".note", async function () {
        const trackId = $("#midiPanel").attr("trackId");

        if (parseInt(app.userId) != app.music.getLocker(trackId).id) {
            app.failedByLock();
            return;
        }
        const posX = $(this).attr("posX");
        const pitch = $(this).attr("pitch");
        const note = { posX, pitch };
        const data = {
            type: "deleteNote",
            userId: app.userId,
            roomId: app.roomId,
            note,
            trackId
        };
        app.emit("noteUpdate", data);
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
            source.detune.value = pitchShift * 100;
        }
        const duration = 0.5;
        app.fadeAudio(source, duration);
    }
};

app.svgToNote = (x, y) => {
    const height = app.pitchHeight * app.keysNum;
    y = height - y;
    x = Math.floor(x / app.gridsInterval * 64);
    y = Math.floor(y / app.pitchHeight);
    const posX = Math.floor(x / (64 * app.noteGrid)) * (64 * app.noteGrid);
    const pitch = y + 12 * (app.scaleNumMin + 1);
    return { posX, pitch };
};

app.createNoteRender = (trackId, note) => {
    const panelId = parseInt($("#midiPanel").attr("trackId"));
    if (panelId === parseInt(trackId)) {
        const interval = app.gridsInterval * note.length;
        const pitchHeight = app.pitchHeight;
        const left = note.posX * app.gridsInterval / 64;
        const bottom = (note.pitch - 24) * pitchHeight;
        const noteDiv = $("<div></div>");
        noteDiv.addClass("note").width(interval).height(pitchHeight);
        noteDiv.css("left", left).css("bottom", bottom);

        noteDiv.attr("pitch", note.pitch);
        noteDiv.attr("length", note.length);
        noteDiv.attr("posX", note.posX);

        const tailDiv = $("<div></div>").addClass("tail");
        noteDiv.append(tailDiv);

        $("#grids").append(noteDiv);
        app.setNoteDrag(noteDiv);
        app.setNoteEditWidth(tailDiv);
    }
};

app.deleteNoteRender = (trackId, note) => {
    const panelId = parseInt($("#midiPanel").attr("trackId"));
    $(`.region[trackId=${trackId}] div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
    if (panelId === parseInt(trackId)) {
        $(`#midiPanel div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
    }
};

app.dragNoteDeleteRender = (trackId, note) => {
    $(`.region[trackId=${trackId}] div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
};

app.noteIntoTrack = (trackId, note) => {
    app.music.tracks[trackId].addNote(new Note(note.pitch, note.posX, note.length));
};

app.addMidiNoteListen = () => {
    $("#svgGrid").click(function (evt) {
        const trackId = parseInt($("#midiPanel").attr("trackId"));
        if (parseInt(app.userId) != app.music.getLocker(trackId).id) {
            app.failedByLock();
            return;
        }
        const target = evt.target;
        const dim = target.getBoundingClientRect();
        const x = evt.clientX - dim.left;
        const y = evt.clientY - dim.top;
        const note = app.svgToNote(x, y);
        app.createNote(note);
    });
};

app.setNoteDrag = (noteDiv) => {
    noteDiv.draggable({
        cursor: "move",
        start: (evt) => {
            const trackId = $("#midiPanel").attr("trackId");
            const posX = parseInt($(evt.target).attr("posX"));
            const pitch = parseInt($(evt.target).attr("pitch"));
            const note = { posX, pitch };
            const data = {
                type: "deleteNote",
                userId: app.userId,
                roomId: app.roomId,
                note,
                trackId
            };
            app.emit("noteUpdate", data);
            app.noteOutTrack(trackId, note);
            app.dragNoteDeleteRender(trackId, note);
        },
        stop: (evt, ui) => {
            const endTop = ui.position.top;
            const endLeft = ui.position.left;
            const resolution = app.gridsInterval * app.noteLength;
            const newTop = Math.round(endTop / app.pitchHeight) * app.pitchHeight;
            const newLeft = Math.round(endLeft / resolution) * resolution;

            const newNote = app.svgToNote(newLeft, newTop + 1);
            const { posX, pitch } = newNote;
            const length = parseFloat($(evt.target).attr("length"));
            newNote.length = length;
            $(evt.target).css("top", newTop).css("left", newLeft)
                .attr("posX", newNote.posX).attr("pitch", newNote.pitch);

            const trackId = $("#midiPanel").attr("trackId");

            //ignore duplicate not at same pos
            const original = app.music.tracks[trackId].notes[posX];
            while ( original && original.filter(midi => midi.pitch === newNote.pitch).length > 0) {
                newNote.pitch += 1;
                const top = newTop - app.pitchHeight * (newNote.pitch - pitch);
                $(evt.target).css("top", top).attr("pitch", newNote.pitch);
                if(top < 0){
                    $(evt.target).remove();
                    return;
                }
            }

            const { instrument } = app.music.tracks[trackId];
            app.playNote(instrument, pitch);
            const data = {
                type: "createNote",
                userId: app.userId,
                roomId: app.roomId,
                trackId,
                note: newNote
            };
            app.emit("noteUpdate", data);
            app.regionNoteRender(trackId, newNote);
            app.noteIntoTrack(trackId, newNote);
        }
    });
};


app.setNoteEditWidth = (tailDiv) => {
    tailDiv.draggable({
        start: (evt) => {
            const trackId = $("#midiPanel").attr("trackId");
            const posX = parseInt($(evt.target).parent().attr("posX"));
            const pitch = parseInt($(evt.target).parent().attr("pitch"));
            const note = { posX, pitch };
            const data = {
                type: "deleteNote",
                userId: app.userId,
                roomId: app.roomId,
                note,
                trackId
            };
            app.emit("noteUpdate", data);
            app.noteOutTrack(trackId, note);
            app.dragNoteDeleteRender(trackId, note);
        },
        drag: (evt, ui) => {
            const { left } = ui.position;
            const resolution = app.gridsInterval * app.noteGrid;
            const change = parseInt(Math.round((left + 5) / resolution)) * resolution;
            if(change <= 0){
                $(evt.target).parent().width(resolution);
                return;
            }
            $(evt.target).parent().width(change);
        },
        stop: (evt) => {
            const noteDiv = $(evt.target).parent();
            const width = noteDiv.width();
            $(evt.target).css("left", width - 10).css("top", 0);
            const length = width / app.gridsInterval;
            noteDiv.attr("length", length);

            const posX = noteDiv.attr("posX");
            const pitch = noteDiv.attr("pitch");
            const newNote = { posX, pitch, length };
            const trackId = $("#midiPanel").attr("trackId");
            const { instrument } = app.music.tracks[trackId];
            app.playNote(instrument, pitch);
            const data = {
                type: "createNote",
                userId: app.userId,
                roomId: app.roomId,
                trackId,
                note: { posX, pitch, length }
            };
            app.emit("noteUpdate", data);
            app.regionNoteRender(trackId, newNote);
            app.noteIntoTrack(trackId, newNote);
        }
    });
};

app.notesRender = (posX, notes) => {
    for (let note of notes) {
        const { pitch, length } = note;
        const left = posX / 64 * app.gridsInterval;
        const bottom = (pitch - 12 * (app.scaleNumMin + 1)) * app.pitchHeight;
        const noteDiv = $("<div></div>");
        noteDiv.addClass("note").width(app.gridsInterval * note.length).height(app.pitchHeight);
        noteDiv.css("left", left).css("bottom", bottom);
        noteDiv.attr("pitch", pitch);
        noteDiv.attr("posX", posX);
        noteDiv.attr("length", length);
        const tailDiv = $("<div></div>").addClass("tail");
        noteDiv.append(tailDiv);
        $("#grids").append(noteDiv);
        if (parseInt(app.userId) === app.music.getLocker($("#midiPanel").attr("trackId")).id) {
            app.setNoteDrag(noteDiv);
            app.setNoteEditWidth(tailDiv);
        }
    }
};


app.noteListen = () => {
    app.noteGridListen();
    app.noteLengthListen();
    app.addMidiNoteListen();
    app.noteDeleteListen();
    app.notSelectListen();
};