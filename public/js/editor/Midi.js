/* eslint-disable no-unused-vars */
/* global app */
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

    getNotes(trackId){
        return this.tracks[trackId].notes;
    }

    getVersions(trackId){
        return this.tracks[trackId].versions;
    }

    getTrack(trackId){
        return this.tracks[trackId];
    }

    setNotes(trackId, notes){
        this.tracks[trackId].setNotes(notes);
    }

    initTracks(tracks) {
        const newTracks = {};
        for (let track of Object.values(tracks)) {
            const { id, name, instrument, version, versions, creator, commiter, lock, notes } = track;
            newTracks[track.id] = new Track(id, name, instrument, version, versions, creator, commiter, lock, notes);
        }
        return newTracks;
    }
}

class Track {
    constructor(id, name, instrument, version = 0, versions = [], creator = { id: app.userId, name: app.username }, commiter = {}, lock = 0, notes = {}) {
        this.id = id;
        this.name = name;
        this.instrument = instrument;
        this.version = version;
        this.versions = versions;
        this.creator = creator;
        this.commiter = commiter;
        this.lock = lock;
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

    setNotes(notes){
        const newNotes = this.initNotes(notes);
        this.notes = newNotes; 
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