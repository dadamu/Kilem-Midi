/* global app */
class Instrument {
    constructor(name, minPitch, maxPitch, url) {
        this.name = name;
        this.minPitch = minPitch;
        this.maxPitch = maxPitch;
        this.sounds = {};
        this.audio = {};
        this.url = url;
        this.generate();
    }

    async generate() {
        this.getFiles();
    }

    async getFiles() {
        const pTasks = [];
        const pitchWaitQueue = [];
        const start = Math.floor((this.minPitch - 1) / 3) * 3 + 1;
        for (let pitch = start; pitch <= this.maxPitch; pitch++) {
            const task = this.getFileTask(pitch, pitchWaitQueue);
            pTasks.push(task);
        }
        await Promise.all(pTasks);
        //other pitch depends on file
        for (let pitch of pitchWaitQueue) {
            const { pitchShift } = this.audio[pitch];
            this.audio[pitch].buffer = this.audio[pitch - pitchShift].buffer;
        }
        return;
    }
    async getFileTask(pitch, waitQueue) {
        const pitchShift = (pitch - 1) % 3;
        this.audio[pitch] = {};
        if (pitchShift === 0) {
            const fileNum = this.getFileNum(pitch);
            const getData = await fetch(`${this.url}${this.name}/${fileNum}-${this.name}.ogg`);
            const blob = await getData.blob();
            const buffer = await blob.arrayBuffer();
            this.audio[pitch].buffer = await app.audioCtx.decodeAudioData(buffer);
        }
        else {
            //queue that wait to async parts ends
            waitQueue.push(pitch);
        }
        this.audio[pitch].pitchShift = pitchShift;
        return;
    }

    getFileNum(pitch) {
        return this.padLeft(pitch.toString(), 3);
    }

    padLeft(str, length) {
        if (str.length >= length)
            return str;
        else
            return this.padLeft("0" + str, length);
    }
}
app.setPiano = (url) => {
    return new Instrument("GrandPiano", 22, 108, url);
};
app.setGuitar = (url) => {
    return new Instrument("AcousticGuitar", 40, 72, url);
};
app.setBass = (url) => {
    return new Instrument("DubBass", 25, 60, url);
};

app.setDrums = (url) => {
    return new Drums("ClassicRock", 36, 56, url);
};

class Drums extends Instrument {
    constructor(name, minPitch, maxPitch, url) {
        super(name, minPitch, maxPitch, url);
    }

    async getFiles() {
        const pTask = [];
        const start = this.minPitch;
        for (let pitch = start; pitch <= this.maxPitch; pitch++) {
            const task = this.getFileTask(pitch);
            pTask.push(task);
        }
        await Promise.all(pTask);
    }
    async getFileTask(pitch) {
        this.audio[pitch] = {};
        if ([39, 40, 52, 54, 55].includes(pitch)) {
            return;
        }
        const fileNum = this.getFileNum(pitch);
        const getData = await fetch(`${this.url}${this.name}/${fileNum}-${this.name}.ogg`);
        const blob = await getData.blob();
        const buffer = await blob.arrayBuffer();
        if (buffer.byteLength <= 183) {
            return;
        }
        this.audio[pitch].buffer = await app.audioCtx.decodeAudioData(buffer);
        return;
    }
}