/* global $ app */
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
    for (let [key, track] of Object.entries(app.music[app.userId].tracks)) {
        app.addTrackRender(key, track.name, track.instrument, track.version);
    }
    return;
};

app.addVersionOption = (track) => {
    const { id, version } = track;
    const option = $("<option></option>").text(version.name).val(version.version);
    const select = $(`.track.track-${id} .version-select`);
    select.append(option);
    select.val(version.version);
};

app.addTrackRender = (trackId, trackName, instrument = "piano", version = 0) => {
    const trackDiv = $("<div></div>").addClass(`track track-${trackId}`).attr("trackId", trackId).attr("version", version);
    const trackNameDiv = $("<div></div>").addClass("track-name").text(trackName);
    const regionDiv = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId);

    const instrumentSelect = $("<select></select>").addClass("instrument-selector").attr("id", "instrumentSelector");
    const pianoOption = $("<option>Piano</option>").val("piano");
    const guitarOption = $("<option>Guitar</option>").val("guitar");
    const bassOption = $("<option>Bass</option>").val("bass");
    $(instrumentSelect).append(pianoOption, guitarOption, bassOption).val(instrument);
    $("#regionContent").append(regionDiv);

    const versionControl = app.trackVersionRender(trackId);
    //const musciControl = app.trackControlRender();

    const track = app.music[app.userId].getTrack(trackId);
    const { creator, lock } = track;
    if(creator.id === app.userId){
        const mine = $("<div></div>").addClass(".track-mine").text("自");
        $(trackDiv).append(mine);
    }
    const lockDiv = $("<div></div>").addClass("track-lock").text("開");
    if(lock){
        $(lockDiv).text("鎖");
    }

    $(trackDiv).append(trackNameDiv, instrumentSelect, versionControl, lockDiv);
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

app.trackVersionRender = (trackId) => {
    const commitButton = $("<button></button>").addClass("version-commit").text("commit");
    const selector = $("<select></select>").addClass("version-select");
    const versions = app.music[app.userId].getVersions(trackId);
    for (let version of versions) {
        const option = $("<option></option>").text(version.name).val(version.version);
        selector.append(option);
    }
    if (versions.length === 0) {
        const option = $("<option></option>").text("No Version").val(0);
        selector.append(option);
        $(selector).val(0);
    }
    else {
        $(selector).val(versions[versions.length - 1].version);
    }
    const versionDiv = $("<div></div>").addClass("version-control");
    versionDiv.append(selector, commitButton);
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

