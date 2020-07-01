/* global $ */
const app = {};
app.trackNum = 0;
app.musicLength = 24;
app.keysNum = 71;
app.scaleInterval = 120;
app.gridsInterval = 160;
app.gridHeight = 19;

app.initKeysRender = async () => {
    $("#keys").html(app.midiKeysHtml);
    return;
};

app.midiSvgGrid = (interval, gridHeight, keysNum) => `
    <svg id="svgGrids"  width="${interval*24}" height="${gridHeight*keysNum}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="svgSmallGrid" width="${Math.floor(interval/4)}" height="${gridHeight}" patternUnits="userSpaceOnUse">
                <path d="M ${Math.floor(interval/4)} 0 L 0 0 0 ${Math.floor(interval/4)}" fill="none" stroke="gray" stroke-width="0.5" />
            </pattern>
            <pattern id="svgGrid" width="${interval}" height="${7*gridHeight}" patternUnits="userSpaceOnUse">
                <rect width="${interval}" height="${keysNum*gridHeight}" fill="url(#svgSmallGrid)" />
                <path d="M ${interval} 0 L 0 0 0 ${interval}" fill="none" stroke="white" stroke-width="2" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#svgGrid)" />
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
    <div class="white-key">C7</div>
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
    <div class="white-key">C-1</div>
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
    <div class="white-key">C-2</div>
    `;