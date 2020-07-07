/* global window AudioContext */
const app = {};

app.setConfig = () => {
    app.room = "test";
    app.scaleNumMax = 5;
    app.scaleNumMin = 1;
    app.musicLength = 8;
    app.keysNum = (app.scaleNumMax - app.scaleNumMin + 1) * 12;
    app.regionInterval = 200;
    app.gridsInterval = 200;
    app.picthHeight = 11.65;
    app.playingTracks = {};
    app.currentTime = 0;
    app.noteLength = 4;
    app.noteGrid = 4;
    app.isplaying = false;
    app.isMidiEditorOpen = false;
    app.instruments = {};
    app.user = "user";
    app.music = {};
    startUserMedia();

};
const startUserMedia = () => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    app.audioCtx = new AudioContext();
};


app.midiSvgGrid = (interval, picthHeight, keysNum, musicLength) => `
    <svg id="svgGrids" class="svgGrids"  width="${interval * musicLength}" height="${picthHeight * keysNum}">
        <defs>
            <pattern id="svgBlackTinyGrid" width="${Math.floor(interval / 8)}" height="${picthHeight}" patternUnits="userSpaceOnUse">
                <rect width="${interval}" height="${(keysNum) * picthHeight}" fill="#333333" />
                <path d="M ${Math.floor(interval / 8)} 0 L 0 0 0 ${Math.floor(interval / 8)}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgWhiteTinyGrid" width="${Math.floor(interval / 8)}" height="${picthHeight}" patternUnits="userSpaceOnUse">
                <rect width="${interval}" height="${(keysNum) * picthHeight}" fill="#444444" />
                <path d="M ${Math.floor(interval / 8)} 0 L 0 0 0 ${Math.floor(interval / 8)}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgWhiteSmallGrid" width="${Math.floor(interval / 4)}" height="${picthHeight}" patternUnits="userSpaceOnUse">
                <rect width="${interval/4}" height="${picthHeight}" fill="url(#svgWhiteTinyGrid)" />
                <path d="M ${Math.floor(interval / 4)} 0 L 0 0 0 ${Math.floor(interval / 4)}" fill="none" stroke="#AAAAAA" stroke-width="0.5" />
            </pattern>
            <pattern id="svgBlackSmallGrid" width="${Math.floor(interval / 4)}" height="${picthHeight}" patternUnits="userSpaceOnUse">
                <rect width="${interval/4}" height="${picthHeight}" fill="url(#svgBlackTinyGrid)" />
                <path d="M ${Math.floor(interval / 4)} 0 L 0 0 0 ${Math.floor(interval / 4)}" fill="none" stroke="#AAAAAA" stroke-width="0.5" />
            </pattern>
            <pattern id="svgMainGrid" width="${interval}" height="${12 * picthHeight}" patternUnits="userSpaceOnUse">
                <rect y="${picthHeight*0}" width="${interval}" height="${picthHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${picthHeight*1}" width="${interval}" height="${picthHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${picthHeight*2}" width="${interval}" height="${picthHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${picthHeight*3}" width="${interval}" height="${picthHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${picthHeight*4}" width="${interval}" height="${picthHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${picthHeight*5}" width="${interval}" height="${picthHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${picthHeight*6}" width="${interval}" height="${picthHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${picthHeight*7}" width="${interval}" height="${picthHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${picthHeight*8}" width="${interval}" height="${picthHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${picthHeight*9}" width="${interval}" height="${picthHeight}" fill="url(#svgWhiteSmallGrid)" />
                <rect y="${picthHeight*10}" width="${interval}" height="${picthHeight}" fill="url(#svgBlackSmallGrid)" />
                <rect y="${picthHeight*11}" width="${interval}" height="${picthHeight}" fill="url(#svgWhiteSmallGrid)" />
                <path d="M ${interval} 0 L 0 0 0 ${interval}" fill="none" stroke="white" stroke-width="2" />
            </pattern>
        </defs>
        <rect id="svgGrid" width="100%" height="100%" fill="url(#svgMainGrid)" />
    </svg>
`;

app.midiKeysTemplate = (num) => {
    const offset = 12;
    return `
    <div class="white-key key" pitch="${num * 12 + 11 + offset}"></div>
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
`;
}