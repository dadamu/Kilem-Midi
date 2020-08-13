/* global app $ */

app.setConfig = () => {
    // Music constant
    app.MUSIC_RESOLUTION = 64;
    app.MUSIC_INTERVAL_KEYS = 12;
    app.PITCH_OFFSET = 12;
    app.PITCH_SHIFT_VALUE = 100;
    app.STANDARD_NOTE = 1 / 4;
    // Music config
    app.roomId = parseInt(document.URL.split('/').pop());
    app.music = {};
    app.instruments = {};
    app.instrumentsURL = '/public/instruments/'; //https://kilem.s3-us-west-2.amazonaws.com/instruments/
    // UI config
    app.musicLength = 400;
    app.maxPosX = app.musicLength * 64;
    app.scaleNumMax = 6;
    app.scaleNumMin = 1;
    app.minPitch = (app.scaleNumMin + 1) * app.MUSIC_INTERVAL_KEYS;
    app.maxPitch = (app.scaleNumMax + 1) * app.MUSIC_INTERVAL_KEYS - 1;
    app.keysNum = (app.scaleNumMax - app.scaleNumMin + 1) * app.MUSIC_INTERVAL_KEYS;
    app.regionInterval = 120;
    app.gridsInterval = 250;
    app.pitchHeight = 11.65;

    // Playing Config
    app.playingTracks = {};
    app.currentTime = 0;
    app.isplaying = false;
    app.islooping = false;

    // Control config
    app.noteLength = 1 / 8;
    app.noteGrid = 1 / 8;
    app.isMidiEditorOpen = false;
    startUserMedia();

};
const startUserMedia = () => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    app.audioCtx = new AudioContext();
};


app.midiSvgGrid = (interval, pitchHeight, keysNum, musicLength) => {
    const fourthNote = 4;
    const eighthNote = 8;
    return `
    <svg id="svgGrids" class="svgGrids"  width="${interval * musicLength}" height="${pitchHeight * keysNum}">
        <defs>
            <pattern id="svgBlackTinyGrid" width="${interval / eighthNote}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${(keysNum) * pitchHeight}" fill="#333333" />
                <path d="M ${interval / eighthNote} 0 L 0 0 0 ${interval / eighthNote}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgWhiteTinyGrid" width="${interval / eighthNote}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${(keysNum) * pitchHeight}" fill="#444444" />
                <path d="M ${interval / eighthNote} 0 L 0 0 0 ${interval / eighthNote}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgWhiteSmallGrid" width="${interval / fourthNote}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${pitchHeight}" fill="url(#svgWhiteTinyGrid)" />
                <path d="M ${interval / fourthNote} 0 L 0 0 0 ${interval / fourthNote}" fill="none" stroke="#AAAAAA" stroke-width="0.5" />
            </pattern>
            <pattern id="svgBlackSmallGrid" width="${interval / 4}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${pitchHeight}" fill="url(#svgBlackTinyGrid)" />
                <path d="M ${interval / fourthNote} 0 L 0 0 0 ${interval / fourthNote}" fill="none" stroke="#AAAAAA" stroke-width="0.5" />
            </pattern>
            <pattern id="svgMainGrid" width="${interval}" height="${app.MUSIC_INTERVAL_KEYS * pitchHeight}" patternUnits="userSpaceOnUse">
                <rect y="${pitchHeight * 0}" width="100%" height="${pitchHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${pitchHeight * 1}" width="100%" height="${pitchHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${pitchHeight * 2}" width="100%" height="${pitchHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${pitchHeight * 3}" width="100%" height="${pitchHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${pitchHeight * 4}" width="100%" height="${pitchHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${pitchHeight * 5}" width="100%" height="${pitchHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${pitchHeight * 6}" width="100%" height="${pitchHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${pitchHeight * 7}" width="100%" height="${pitchHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${pitchHeight * 8}" width="100%" height="${pitchHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${pitchHeight * 9}" width="100%" height="${pitchHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${pitchHeight * 10}" width="100%" height="${pitchHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${pitchHeight * 11}" width="100%" height="${pitchHeight}" fill="url(#svgWhiteSmallGrid)" />
                <path d="M ${interval} 0 L 0 0 0 ${interval}" fill="none" stroke="white" stroke-width="2" />
            </pattern>
        </defs>
        <rect id="svgGrid" width="100%" height="100%" fill="url(#svgMainGrid)" />
    </svg>
`;
};

app.rulerSvgGrid = (interval, musicLength) => {
    const fourthNote = 4;
    return `
    <svg id="rulerGirds" class="svgGrids"  width="${interval * musicLength}" height="100%">
        <defs>
            <pattern id="rulerSubGrid" width="${interval / fourthNote}" height="100%" patternUnits="userSpaceOnUse">
                <rect width="${interval / fourthNote}" height="100%" fill="none" />
                <path d="M0 15 V${interval / fourthNote}" fill="none" stroke="white" stroke-width="1" />
            </pattern>
            <pattern id="rulerMainGrid" width="${interval}" height="100%" patternUnits="userSpaceOnUse">
                <rect width="${interval}" height="100%" fill="url(#rulerSubGrid)" />
                <path d="M0 5 V${interval}" fill="none" stroke="white" stroke-width="2" />
            </pattern>
        </defs>
        <rect id="rulerGrid" width="100%" height="100%" fill="url(#rulerMainGrid)" />
    </svg>
    `;
};

app.midiKeysTemplate = (num) => {
    const offsetFloor = num - app.scaleNumMin;
    const offset = app.minPitch;
    return `
        <div class="white-key key" pitch="${offsetFloor * 12 + 11 + offset}"></div >
        <div class="black-key key" pitch="${offsetFloor * 12 + 10 + offset}"></div>
        <div class="white-key key" pitch="${offsetFloor * 12 + 9 + offset}"></div>
        <div class="black-key key" pitch="${offsetFloor * 12 + 8 + offset}"></div>
        <div class="white-key key" pitch="${offsetFloor * 12 + 7 + offset}"></div>
        <div class="black-key key" pitch="${offsetFloor * 12 + 6 + offset}"></div>
        <div class="white-key key" pitch="${offsetFloor * 12 + 5 + offset}"></div>
        <div class="white-key key" pitch="${offsetFloor * 12 + 4 + offset}"></div>
        <div class="black-key key" pitch="${offsetFloor * 12 + 3 + offset}"></div>
        <div class="white-key key" pitch="${offsetFloor * 12 + 2 + offset}"></div>
        <div class="black-key key" pitch="${offsetFloor * 12 + 1 + offset}"></div>
        <div class="white-key key" pitch="${offsetFloor * 12 + offset}">C${num}</div>
`;
};

app.pxToNum = (px) => {
    return parseFloat(px.replace('px', ''));
};

app.getTrackId = () => {
    return $('.track.selected').attr('trackId');
};
app.getPanelId = () => {
    return $('#midiPanel').attr('trackId');
};

app.timeToPosX = (time, bpm) => {
    return Math.floor(time / (60 / bpm * 1000) * 16);
};

app.posXToPx = (posX, interval) => {
    return posX / app.MUSIC_RESOLUTION * interval; 
};

app.posToTime = (pos, interval) => {
    return pos / app.STANDARD_NOTE / interval * 60 / app.music.get('bpm') * 1000;
};

app.getPlayResolution = (bpm) => {
    const playGrid = app.MUSIC_RESOLUTION * app.STANDARD_NOTE;
    return  60 / bpm / playGrid * 1000;
};