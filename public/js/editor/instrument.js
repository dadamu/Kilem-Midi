/* global app fetch */
class Instrument {
    constructor(name, minPitch, maxPitch) {
        this.name = name;
        this.minPitch = minPitch;
        this.maxPitch = maxPitch;
        this.sounds = {};
        this.buffers = {};
        this.generate();
    }

    async generate() {
        await this.getFiles();
        for (let pitch = this.minPitch; pitch <= this.maxPitch; pitch++) {
            const sound = this.getSound(pitch);
            this.sounds[pitch] = sound;
        }
    }

    async getFiles() {
        const pTask = [];
        for (let pitch = this.minPitch; pitch <= this.maxPitch; pitch++) {
            const task = new Promise((resolve) => {
                const asyncDo = async () => {
                    const getData = await fetch(`/public/instruments/${this.name}/${this.padLeft(pitch, 3)}-${this.name}.ogg`);
                    const blob = await getData.blob();
                    const buffer = await blob.arrayBuffer();
                    this.buffers[pitch] = await app.audioCtx.decodeAudioData(buffer);
                    resolve();
                }
                asyncDo();
            });
            pTask.push(task);
        }
        return Promise.all(pTask);
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