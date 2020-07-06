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
    constructor(trackId, instrument, notes = {}) {
        this.trackId = trackId;
        this.instrument = instrument
        this.notes = notes;
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
        if(posXNotes.length===0)
            delete this.notes[posX]
        else
            this.notes[posX] = posXNotes;
    }
}

class Note{
    constructor(pitch, posX, length){
        this.pitch = pitch;
        this.posX = posX;
        this.length = length;
    }
}