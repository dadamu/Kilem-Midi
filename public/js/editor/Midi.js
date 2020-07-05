/* eslint-disable no-unused-vars */
class MidiDoc{
    constructor(bpm) {
        this.bpm = bpm;
        this.tracks = {};
    }
    addTrack(track){
        this.tracks[track.trackId] = track;
    }
    deleteTrack(trackId){
        delete this.tracks[trackId];
    }
    outPutPlayMidi(){
        return JSON.parse(JSON.stringify(this.tracks));
    }
}

class Track{
    constructor(trackId, instrument) {
        this.trackId = trackId;
        this.instrument = instrument
        this.notes = {};
    }
    
    addNote(note){
        const { posX } = note;
        if(this.notes[posX]){
            this.notes[posX].push(note);
        }
        else{
            this.notes[posX] = [note];
        }
    }

    deleteNote(note){
        const { posX, pitch } = note;
        const posXNotes = this.notes[posX].filter(note => note.pitch != pitch);
        this.notes[posX] = posXNotes;
    }
}

class Note{
    constructor(pitch, posX, duration){
        this.pitch = pitch;
        this.posX = posX;
        this.duration = duration;
    }
}