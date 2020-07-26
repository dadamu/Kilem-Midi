/* global $ app */

app.trackListen = () => {
    app.trackNameChangeListen();
    app.trackSelectListen();
};

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

app.initiTrackRender = () => {
    for (let [key, track] of Object.entries(app.music.tracks)) {
        app.addTrackRender(key, track.name, track.instrument, track.version.version);
    }
    app.trackSelect($(".track").first());
    return;
};

app.lockerRender = (locker) => {
    const lockDiv = $("<div></div>").addClass("track-lock");
    const iconDiv = $("<span></span>").addClass("lock-icon").text("開");
    if (locker) {
        if (!locker.id){
            $(iconDiv).text("開");
            lockDiv.append(iconDiv);
        }
        else if (locker.id === app.userId) {
            $(iconDiv).text("自");
            lockDiv.append(iconDiv);
        }
        else{
            const lockerDiv = $("<span></span>").addClass("locker-name").text(locker.name);
            $(iconDiv).text("鎖:");
            lockDiv.append(iconDiv, lockerDiv);
        }
    }
    return lockDiv;
};

app.addVersionOption = (track) => {
    const { id, version } = track;
    const option = $("<option></option>").text(version.name).val(version.version);
    const select = $(`.track.track-${id} .version-select`);
    $(`.track.track-${id} option[value='0']`).remove();
    select.append(option);
    select.val(version.version);
};

app.addTrackRender = (trackId, trackName, instrument = "piano", version = 0) => {
    const regionDiv = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId);
    $(regionDiv).width(app.musicLength * app.regionInterval);
    $("#regionContent").append(regionDiv);

    const trackDiv = $("<div></div>").addClass(`track track-${trackId}`).attr("trackId", trackId).attr("version", version);
    const infoDiv = $("<div></div>").addClass("track-info");
    const trackNameDiv = $("<input></input>").addClass("track-name").val(trackName).attr("disabled", true);
    const instrumentSelect = $("<select></select>").addClass("instrument-selector");
    const pianoOption = $("<option>Piano</option>").val("piano");
    const guitarOption = $("<option>Guitar</option>").val("guitar");
    const bassOption = $("<option>Bass</option>").val("bass");
    const drumsOption = $("<option>Drums</option>").val("drums");
    $(instrumentSelect).append(pianoOption, guitarOption, bassOption, drumsOption).val(instrument);
    infoDiv.append(trackNameDiv, instrumentSelect);

    const versionControl = app.trackVersionRender(trackId);
    //const musciControl = app.trackControlRender();

    const track = app.music.getTrack(trackId);
    const { locker } = track;
    const lockDiv = app.lockerRender(locker);
    if(locker.id === app.userId){
        trackNameDiv.addClass("editable").removeAttr("disabled");
    }
    $(trackDiv).append(lockDiv, infoDiv, versionControl);
    $("#tracksContent").append(trackDiv);
    return;
};

app.trackVersionRender = (trackId) => {
    const commitButton = $("<button></button>").addClass("version-commit").text("commit");
    const selector = $("<select></select>").addClass("version-select");
    const versions = app.music.getVersions(trackId);
    for (let version of versions) {
        const option = $("<option></option>").text(version.name).val(version.version);
        selector.append(option);
    }
    if (versions.length === 0) {
        const option = $("<option></option>").text("no version").val(0);
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

app.trackNameChangeListen = () => {
    $("#tracksContent").on("change", ".track-name", async function(){
        const newName = $(this).val();
        const trackId = $(this).closest(".track").attr("trackId");
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/name`, {
            userId: app.userId,
            name: newName,
            roomId: app.roomId
        }, "PATCH");
        if(res.error){
            app.errorShow(res.error);
            $(this).val(app.music.tracks[trackId].name);
            return;
        }
        app.music.tracks[trackId].name = newName;
    });
};


