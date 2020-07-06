/* global $ app Track */
app.initRulerRender = async () => {
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

app.initRegionRender = async () => {
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

app.initiTrackRender = async() =>{
    let trackDiv;
    for( let [key, track] of Object.entries(app.music[app.user].tracks)){
        trackDiv = addTrackRender(key, track.trackName, track.instrument);
    }
    app.trackSelect(trackDiv);
    return;
};

app.addTrack = () => {
    const trackId = ++app.trackNum;
    const trackName = "Track" + trackId;
    const trackDiv = addTrackRender(trackId, trackName);
    app.music[app.user].addTrack(new Track(trackId, trackName, 'piano'));
    app.trackSelect(trackDiv);
};

const addTrackRender = (trackId, trackName, instrument="piano") => {
    const trackDiv = $("<div></div>").addClass(`track track-${trackId}`).attr("trackId", trackId);
    const trackNameDiv = $("<div></div>").addClass("track-name").text(trackName);
    const region = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId);

    const instrumentSelect = $("<select></select>").addClass("instrument-selector").attr("id", "instrumentSelector");
    const pianoOption = $("<option>Piano</option>").val("piano");
    const guitarOption = $("<option>Guitar</option>").val("guitar");
    const bassOption = $("<option>Bass</option>").val("bass");
    $(instrumentSelect).append(pianoOption, guitarOption, bassOption).val(instrument);
    $("#regionContent").append(region);
    $(region).width(app.musicLength * app.regionInterval);
    $(trackDiv).append(trackNameDiv, instrumentSelect);
    $("#tracksContent").append(trackDiv);
    return trackDiv;
}


app.deleteTrackListen = () => {
    $("#deleteTrack").click(() => {
        const selectedTrack = $(".track.selected");
        app.music[app.user].deleteTrack(selectedTrack.attr('trackId'));
        selectedTrack.remove();
        $(".region.selected").remove();
        $(".track").last().addClass("selected");
        $(".region").last().addClass("selected");
        app.panelLoadTrack($(".region").last().attr("trackId"));
    });
};

app.trackSelectListen = () => {
    $("#tracksContent").on('click', '.track', function () {
        app.trackSelect(this);
    });
    $("#regionContent").on('click', '.region', function () {
        app.trackSelect(this);
    });
};

app.trackSelect = (target) => {
    const id = $(target).attr("trackId");
    $(".track.selected").removeClass("selected");
    $(".region.selected").removeClass("selected");
    $(`.track.track-${id}`).addClass('selected');
    $(`.region.track-${id}`).addClass("selected");

    const trackName = $(`.track.track-${id} .track-name`).text();
    $("#midiPanel #trackName").text(trackName);
    app.panelLoadTrack($(".track.selected").attr("trackId"));
};

app.changeInstrumentListen = () => {
    $(".tracks-title").on("change", ".instrument-selector", function () {
        const trackId = $(this).parent().attr("trackId");
        const instrument = $(this).val();
        app.music[app.user].tracks[trackId].instrument = instrument;
    });
};

