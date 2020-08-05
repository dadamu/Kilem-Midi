/* global app */

app.setConfig = () => {
    // User config
    app.token = "";

    // Music config
    app.roomId = parseInt(document.URL.split("/").pop());
    app.music = {};
    app.instruments = {};
    app.instrumentsURL = "/public/instruments/"; //https://kilem.s3-us-west-2.amazonaws.com/instruments/
    // UI config
    app.musicLength = 400;
    app.scaleNumMax = 6;
    app.scaleNumMin = 1;
    app.keysNum = (app.scaleNumMax - app.scaleNumMin + 1) * 12;
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


app.midiSvgGrid = (interval, pitchHeight, keysNum, musicLength) => `
    <svg id="svgGrids" class="svgGrids"  width="${interval * musicLength}" height="${pitchHeight * keysNum}">
        <defs>
            <pattern id="svgBlackTinyGrid" width="${interval / 8}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${(keysNum) * pitchHeight}" fill="#333333" />
                <path d="M ${interval / 8} 0 L 0 0 0 ${interval / 8}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgWhiteTinyGrid" width="${interval / 8}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${(keysNum) * pitchHeight}" fill="#444444" />
                <path d="M ${interval / 8} 0 L 0 0 0 ${interval / 8}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgWhiteSmallGrid" width="${interval / 4}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${pitchHeight}" fill="url(#svgWhiteTinyGrid)" />
                <path d="M ${interval / 4} 0 L 0 0 0 ${interval / 4}" fill="none" stroke="#AAAAAA" stroke-width="0.5" />
            </pattern>
            <pattern id="svgBlackSmallGrid" width="${interval / 4}" height="${pitchHeight}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="${pitchHeight}" fill="url(#svgBlackTinyGrid)" />
                <path d="M ${interval / 4} 0 L 0 0 0 ${interval / 4}" fill="none" stroke="#AAAAAA" stroke-width="0.5" />
            </pattern>
            <pattern id="svgMainGrid" width="${interval}" height="${12 * pitchHeight}" patternUnits="userSpaceOnUse">
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

app.rulerSvgGrid = (interval, musicLength) => `
    <svg id="rulerGirds" class="svgGrids"  width="${interval * musicLength}" height="100%">
        <defs>
            <pattern id="rulerSubGrid" width="${interval/4}" height="100%" patternUnits="userSpaceOnUse">
                <rect width="${interval/4}" height="100%" fill="none" />
                <path d="M0 15 V${interval/4}" fill="none" stroke="white" stroke-width="1" />
            </pattern>
            <pattern id="rulerMainGrid" width="${interval}" height="100%" patternUnits="userSpaceOnUse">
                <rect width="${interval}" height="100%" fill="url(#rulerSubGrid)" />
                <path d="M0 5 V${interval}" fill="none" stroke="white" stroke-width="2" />
            </pattern>
        </defs>
        <rect id="rulerGrid" width="100%" height="100%" fill="url(#rulerMainGrid)" />
    </svg>
    `;

app.midiKeysTemplate = (num) => {
    const offset = 12;
    return `
    <div class="white-key key" pitch="${num * 12 + 11 + offset}" ></div >
        <div class="black-key key" pitch="${num * 12 + 10 + offset}"></div>
        <div class="white-key key" pitch="${num * 12 + 9 + offset}"></div>
        <div class="black-key key" pitch="${num * 12 + 8 + offset}"></div>
        <div class="white-key key" pitch="${num * 12 + 7 + offset}"></div>
        <div class="black-key key" pitch="${num * 12 + 6 + offset}"></div>
        <div class="white-key key" pitch="${num * 12 + 5 + offset}"></div>
        <div class="white-key key" pitch="${num * 12 + 4 + offset}"></div>
        <div class="black-key key" pitch="${num * 12 + 3 + offset}"></div>
        <div class="white-key key" pitch="${num * 12 + 2 + offset}"></div>
        <div class="black-key key" pitch="${num * 12 + 1 + offset}"></div>
        <div class="white-key key" pitch="${num * 12 + offset}">C${num}</div>
    </div>
`;
};