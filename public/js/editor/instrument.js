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
        for (let pitch = this.minPitch; pitch <= this.maxPitch; pitch++) {
            const task = new Promise((resolve) => {
                const asyncDo = async () => {
                    const condition = (pitch-1) % 3;
                    const fileNum = this.getFileNum(condition, pitch);
                    const getData = await fetch(`/public/instruments/${this.name}/${fileNum}-${this.name}.ogg`);
                    const blob = await getData.blob();
                    const buffer = await blob.arrayBuffer();
                    this.audio[pitch] = {}; 
                    this.audio[pitch].buffer= await app.audioCtx.decodeAudioData(buffer);
                    this.audio[pitch].condition = condition;
                    resolve();
                }
                asyncDo();
            });
            pTask.push(task);
        }
        return Promise.all(pTask);
    }

    getFileNum(condition, pitch){
        
        return this.padLeft(pitch-condition, 3);
    }

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
    source.stop(currentTime + duration  );
};