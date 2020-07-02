/* global $ */
const app = {};
app.trackNum = 0;
app.musicLength = 9;
app.keysNum = 84;
app.scaleInterval = 120;
app.gridsInterval = 160;
app.picthHeight = 11.65;

app.initKeysRender = async () => {
    $("#keys").html(app.midiKeysHtml);
    return;
};

app.midiSvgGrid = (interval, picthHeight, keysNum, musicLength) => `
    <svg id="svgGrids" class="svgGrids"  width="${interval*musicLength}" height="${picthHeight*keysNum}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="svgSmallGrid" width="${Math.floor(interval/4)}" height="${picthHeight}" patternUnits="userSpaceOnUse">
                <path d="M ${Math.floor(interval/4)} 0 L 0 0 0 ${Math.floor(interval/4)}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgMainGrid" width="${interval}" height="${12*picthHeight}" patternUnits="userSpaceOnUse">
                <rect width="${interval}" height="${keysNum*picthHeight}" fill="url(#svgSmallGrid)" />
                <path d="M ${interval} 0 L 0 0 0 ${interval}" fill="none" stroke="white" stroke-width="2" />
            </pattern>
        </defs>
        <rect id="svgGrid" width="100%" height="100%" fill="url(#svgMainGrid)" />
    </svg>
`;

app.midiKeysHtml = `
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key">C6</div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key">C5</div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key">C4</div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key middle-c">C3</div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key">C2</div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key">C1</div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key"></div>
    <div class="black-key"></div>
    <div class="white-key">C0</div>
    `;