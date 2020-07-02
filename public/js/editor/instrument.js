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
        const pitchWaitTask = [];
        const start = Math.floor((this.minPitch-1)/3) * 3 + 1;
        for (let pitch = start; pitch <= this.maxPitch; pitch++) {
            const task = new Promise((resolve) => {
                const asyncDo = async () => {
                    const pitchShift = (pitch - 1) % 3;
                    this.audio[pitch] = {};
                    if (pitchShift === 0) {
                        const fileNum = this.getFileNum(pitch);
                        const getData = await fetch(`/public/instruments/${this.name}/${fileNum}-${this.name}.ogg`);
                        const blob = await getData.blob();
                        const buffer = await blob.arrayBuffer();
                        this.audio[pitch].buffer = await app.audioCtx.decodeAudioData(buffer);
                    }
                    else{
                        //queue that wait to async parts ends
                        pitchWaitTask.push(pitch);
                    }
                    this.audio[pitch].pitchShift = pitchShift;
                    resolve();
                }
                asyncDo();
            });
            pTask.push(task);
        }
        await Promise.all(pTask);
        //other pitch depends on file
        for(let pitch of pitchWaitTask){
            const { pitchShift } = this.audio[pitch];
            this.audio[pitch].buffer = this.audio[pitch-pitchShift].buffer;
        }
        return;
    }

    getFileNum(pitch) {
        return this.padLeft(pitch, 3);
    };

    padLeft(str, length) {
        if (str.length >= length)
            return str;
        else
            return this.padLeft("0" + str, length);
    }
}

app.setPiano = () => {
    return new Instrument("GrandPiano", app.scaleNumMin * 12 + 12, (app.scaleNumMax + 1) * 12 + 12);
};

app.fadeAudio = function (source, duration) {
    const currentTime = app.audioCtx.currentTime;
    const gain = app.audioCtx.createGain();
    gain.gain.linearRampToValueAtTime(0, currentTime + duration);

    source.connect(gain);
    gain.connect(app.audioCtx.destination);
    source.start(0);
    source.stop(currentTime + duration);
};