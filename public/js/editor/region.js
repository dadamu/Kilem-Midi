/* global app $ */

app.regionNoteRender = (trackId, note) => {
    const region = $(`.region.track-${trackId}`);
    const pitchHeight = region.height() / (app.keysNum);
    const interval = app.regionInterval * note.length;
    const left = note.posX * app.regionInterval / 64;
    const bottom = (note.pitch - 24) * pitchHeight;
    const noteDiv = $("<div></div>");
    noteDiv.addClass("regionNote").width(interval).height(pitchHeight);
    noteDiv.css("left", left).css("bottom", bottom);
    noteDiv.attr("pitch", note.pitch);
    noteDiv.attr("length", note.length);
    noteDiv.attr("posX", note.posX);
    region.append(noteDiv);
};

app.regionNoteDelete = (trackId, note) => {
    $(`.region.track-${trackId} div[posX="${note.posX}"][pitch=${note.pitch}]`).remove();
};

app.initRegionNoteRender = () => {
    for (let track of Object.values(app.music.get("tracks"))) {
        app.loadRegionNotesRender(track.id);
    }
};

app.loadRegionNotesRender = (trackId) => {
    $(`.region.track-${trackId} .regionNote`).remove();
    const notes = app.music.getTrack(trackId).get("notes");
    for (let onePosNotes of Object.values(notes)) {
        onePosNotes.forEach(note => app.regionNoteRender(trackId, note));
    }
};