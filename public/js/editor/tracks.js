/* global $ app Track */
app.initRulerRender = () => {
    const length = app.musicLength;
    const interval = app.regionInterval;
    const rulerScale = $("#rulerScale");
    for (let i = 0; i < length + 1; i++) {
        const scaleNum = (i * interval).toString();
        let scale;
        if (i !== length) {
            scale = $("<span></span>").css("left", scaleNum).addClass("scale").text((i + 1).toString());
        }
        $(rulerScale).append(scale);
    }
    $("#ruler").width((length) * interval);
    return;
};

app.initRegionRender = () => {
    const interval = app.regionInterval;
    const length = app.musicLength;
    const width = interval * length;
    $("#tracksRegion").width(width);
    return;
};


app.addTrackListen = () => {
    $("#addTrack").click(() => {
        app.addTrack();
    });
};

app.initiTrackRender = () => {
    let trackDiv;
    for (let [key, track] of Object.entries(app.music[app.userId].tracks)) {
        trackDiv = addTrackRender(key, track.name, track.instrument);
    }
    app.trackSelect(trackDiv);
    return;
};

app.addTrack = () => {
    const trackId = ++app.trackNum;
    const trackName = "Track" + trackId;
    const trackDiv = addTrackRender(trackId, trackName);
    app.music[app.userId].addTrack(new Track(trackId, trackName, "piano"));
    app.trackSelect(trackDiv);
};

const addTrackRender = (trackId, trackName, instrument = "piano") => {
    const trackDiv = $("<div></div>").addClass(`track track-${trackId}`).attr("trackId", trackId);
    const trackNameDiv = $("<div></div>").addClass("track-name").text(trackName);
    const regionDiv = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId);

    const instrumentSelect = $("<select></select>").addClass("instrument-selector").attr("id", "instrumentSelector");
    const pianoOption = $("<option>Piano</option>").val("piano");
    const guitarOption = $("<option>Guitar</option>").val("guitar");
    const bassOption = $("<option>Bass</option>").val("bass");
    $(instrumentSelect).append(pianoOption, guitarOption, bassOption).val(instrument);
    $("#regionContent").append(regionDiv);

    const versionControl = app.trackVersionRender();
    //const musciControl = app.trackControlRender();
    $(trackDiv).append(trackNameDiv, instrumentSelect, versionControl);
    $("#tracksContent").append(trackDiv);

    $(regionDiv).width(app.musicLength * app.regionInterval);
    return trackDiv;
};


app.deleteTrackListen = () => {
    $("#deleteTrack").click(() => {
        const selectedTrack = $(".track.selected");
        app.music[app.userId].deleteTrack(selectedTrack.attr("trackId"));
        selectedTrack.remove();
        $(".region.selected").remove();
        $(".track").last().addClass("selected");
        $(".region").last().addClass("selected");
        app.panelLoadTrack($(".region").last().attr("trackId"));
    });
};

app.trackVersionRender = () => {
    const commitButton = $("<button></button>").addClass("version-commit").text("commit");
    const pullButton = $("<button></button>").addClass("version-pull").text("Pull");
    const versionDiv = $("<div></div>").addClass("version-control");
    versionDiv.append(pullButton, commitButton);
    return versionDiv;
};

app.trackControlRender = () => {
    const muteButton = $("<button></button>").addClass("control-mute").text("M");
    const singleButton = $("<button></button>").addClass("control-single").text("S");
    const controlDiv = $("<div></div>").addClass("track-control");
    controlDiv.append(singleButton, muteButton);
    return controlDiv;
};

app.trackSelectListen = () => {
    $("#tracksContent").on("click", ".track", function () {
        app.trackSelect(this);
    });
    $("#regionContent").on("click", ".region", function () {
        app.trackSelect(this);
    });
};

app.trackSelect = (target) => {
    const id = $(target).attr("trackId");
    $(".track.selected").removeClass("selected");
    $(".region.selected").removeClass("selected");
    $(`.track.track-${id}`).addClass("selected");
    $(`.region.track-${id}`).addClass("selected");

    const trackName = $(`.track.track-${id} .track-name`).text();
    $("#midiPanel #trackName").text(trackName);
    app.panelLoadTrack($(".track.selected").attr("trackId"));
};

app.changeInstrumentListen = () => {
    $(".tracks-title").on("change", ".instrument-selector", function () {
        const trackId = $(this).parent().attr("trackId");
        const instrument = $(this).val();
        app.music[app.userId].tracks[trackId].instrument = instrument;
    });
};

