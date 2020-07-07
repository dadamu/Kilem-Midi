/* global app fetch */
class Instrument {
    constructor(name, minPitch, maxPitch) {
        this.name = name;
        this.minPitch = minPitch;
        this.maxPitch = maxPitch;
        this.sounds = {};
        this.audio = {};
        this.generate();
    }

    async generate() {
        this.getFiles();
    }

    async getFiles() {
        const pTask = [];
        const pitchWaitQueue = [];
        const start = Math.floor((this.minPitch - 1) / 3) * 3 + 1;
        for (let pitch = start; pitch <= this.maxPitch; pitch++) {
            const task = this.getFileTask(pitch, pitchWaitQueue);
            pTask.push(task);
        }
        await Promise.all(pTask);
        //other pitch depends on file
        for (let pitch of pitchWaitQueue) {
            const { pitchShift } = this.audio[pitch];
            this.audio[pitch].buffer = this.audio[pitch - pitchShift].buffer;
        }
        return;
    }

    getFileTask(pitch, waitQueue) {
        return new Promise((resolve) => {
            const asyncDo = async()=>{
                const pitchShift = (pitch - 1) % 3;
                this.audio[pitch] = {};
                if (pitchShift === 0) {
                    const fileNum = this.getFileNum(pitch);
                    const getData = await fetch(`/public/instruments/${this.name}/${fileNum}-${this.name}.ogg`);
                    const blob = await getData.blob();
                    const buffer = await blob.arrayBuffer();
                    this.audio[pitch].buffer = await app.audioCtx.decodeAudioData(buffer);
                }
                else {
                    //queue that wait to async parts ends
                    waitQueue.push(pitch);
                }
                this.audio[pitch].pitchShift = pitchShift;
                resolve();
            };
            asyncDo();
        });
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
app.setPiano = () => {
    return new Instrument("GrandPiano", 22, 108);
};
app.setGuitar = () => {
    return new Instrument("AcousticGuitar", 40, 72);
};
app.setBass = () => {
    return new Instrument("DubBass", 25, 60);
};