/* eslint-disable no-unused-vars */
/* global app Midi */
class MidiFile {
    constructor(bpm, tracks = {}) {
        this.bpm = bpm;
        this.tracks = this.setTracks(tracks);
    }

    set(key, value){
        this[key] = value;
    }

    get(key){
        return this[key];
    }

    getTrack(id){
        return this.tracks[id];
    }

    addTrack(track) {
        this.tracks[track.id] = track;
    }

    deleteTrack(id) {
        delete this.tracks[id];
    }

    setTrack(track) {
        const { id } = track;
        this.tracks[id].set('notes', track.notes);
        this.tracks[id].set('commiter', track.commiter);
        this.tracks[id].addVersion(track.version);
        this.tracks[id].set('version', track.version.version);
    }

    setTracks(tracks) {
        const newTracks = {};
        for (let track of Object.values(tracks)) {
            console.log(track);
            const { id, name, instrument, version, versions, locker, commiter, notes } = track;
            const newTrack = new Track(id, name, instrument);
            newTrack.set('version', version);
            newTrack.set('versions', versions);
            newTrack.set('locker', locker);
            newTrack.set('commiter', commiter);
            newTrack.set('notes', notes);
            newTracks[track.id] = newTrack;
        }
        return newTracks;
    }

    export() {
        const bpm = this.bpm;
        const midi = new Midi();
        midi.header.setTempo(bpm);
        for (let track of Object.values(this.tracks)) {
            const exTrack = midi.addTrack();
            exTrack.name = track.name;
            for (let notes of Object.values(track.notes)) {
                notes.forEach(note => {
                    const midiNote = {
                        midi: note.pitch,
                        time: note.posX * (60 / bpm) / 16,
                        duration: note.length * (60 / bpm) * 4
                    };
                    exTrack.addNote(midiNote);
                });
            }
        }
        return new Blob([midi.toArray()], { type: 'audio/x-midi' });
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

    set(key, value){
        this[key] = value;
    }

    get(key){
        return this[key];
    }


    addVersion(version) {
        this.versions.push(version);
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
        this.pitch = parseInt(pitch);
        this.posX = parseInt(posX);
        this.length = parseFloat(length);
    }
}