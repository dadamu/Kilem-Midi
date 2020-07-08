/* eslint-disable no-unused-vars */
class MidiFile {
    constructor(bpm, tracks = {}) {
        this.bpm = bpm;
        this.tracks = this.initTracks(tracks);
    }
    addTrack(track) {
        this.tracks[track.id] = track;
    }
    deleteTrack(id) {
        delete this.tracks[id];
    }
    outPutPlayMidi() {
        return JSON.parse(JSON.stringify(this.tracks));
    }
    initTracks(tracks) {
        const newTracks = {};
        for (let track of Object.values(tracks)) {
            newTracks[track.id] = new Track(track.id, track.name, track.instrument, track.notes);
        }
        return newTracks;
    }
}

class MasterMidi extends MidiFile {
    constructor(fileName, bpm, tracks = {}) {
        super(bpm, tracks);
        this.fileName = fileName;
    }
}

class Track {
    constructor(id, name, instrument, notes = {}) {
        this.id = id;
        this.name = name;
        this.instrument = instrument;
        this.notes = this.initNotes(notes);
    }

    addNote(note) {
        const { posX } = note;
        if (this.notes[posX]) {
            this.notes[posX].push(note);
        }
        else {
            this.notes[posX] = [note];
        }
    }

    deleteNote(note) {
        const { posX, pitch } = note;
        const posXNotes = this.notes[posX].filter(note => note.pitch != pitch);
        if (posXNotes.length === 0)
            delete this.notes[posX];
        else
            this.notes[posX] = posXNotes;
    }
    initNotes(notes) {
        const newNotes = {};
        for (let [posX, xNotes] of Object.entries(notes)) {
            newNotes[posX] = xNotes.map(note => new Note(note.pitch, note.posX, note.length));
        }
        return newNotes;
    }
}

class Note {
    constructor(pitch, posX, length) {
        this.pitch = pitch;
        this.posX = posX;
        this.length = length;
    }
}