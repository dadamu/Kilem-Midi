/* eslint-disable no-unused-vars */
/* global app */
class MidiFile {
    constructor(bpm, tracks = {}) {
        this.bpm = bpm;
        this.tracks = this.setTracks(tracks);
    }
    addTrack(track) {
        this.tracks[track.id] = track;
    }
    deleteTrack(id) {
        delete this.tracks[id];
    }
    getTracks() {
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

    setTrack(track){
        const { id } = track;
        this.setNotes(id, track.notes);
        this.tracks[id].setCommiter(track.commiter);
        this.tracks[id].addVersion(track.version);
        this.tracks[id].setVersion(track.version);
    }

    setNotes(trackId, notes){
        this.tracks[trackId].setNotes(notes);
    }

    setTracks(tracks) {
        const newTracks = {};
        for (let track of Object.values(tracks)) {
            const { id, name, instrument, version, versions, locker, commiter, notes } = track;
            const newTrack = new Track(id, name, instrument);
            newTrack.setVersion(version);
            newTrack.setVersions(versions);
            newTrack.setLocker(locker);
            newTrack.setCommiter(commiter);
            newTrack.setNotes(notes);
            newTracks[track.id] = newTrack;
        }
        return newTracks;
    }
}

class Track {
    constructor(id, name, instrument) {
        this.id = id;
        this.name = name;
        this.instrument = instrument;
        this.version = 0;
        this.versions = [];
        this.locker = {};
        this.commiter = {};
        this.notes = {};
    }

    setVersion(version){
        this.version = version;
    }

    addVersion(version){
        this.versions.push(version);
    }

    setVersions(versions){
        this.versions = versions;
    }

    setLocker(locker){
        this.locker = locker;
    }

    setCommiter(commiter){
        this.commiter = commiter;
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

    setNotes(notes) {
        const newNotes = {};
        for (let [posX, xNotes] of Object.entries(notes)) {
            newNotes[posX] = xNotes.map(note => new Note(note.pitch, note.posX, note.length));
        }
        this.notes = newNotes;
    }
}

class Note {
    constructor(pitch, posX, length) {
        this.pitch = pitch;
        this.posX = posX;
        this.length = length;
    }
}