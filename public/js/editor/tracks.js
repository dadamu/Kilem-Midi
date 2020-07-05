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

app.addTrack = () => {
    const trackId = ++app.trackNum;
    const trackDiv = $("<div></div>").addClass(`track track-${trackId}`).attr("trackId", trackId);
    const trackName = $("<div></div>").addClass("track-name").text("Track" + trackId);
    const region = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId);

    const instrument = $("<select></select>").addClass("instrument-selector").attr("id", "instrumentSelector").val("piano");
    const pianoOption = $("<option>Piano</option>").val("piano");
    const guitarOption = $("<option>Guitar</option>").val("guitar");
    const bassOption = $("<option>Bass</option>").val("bass");
    $(instrument).append(pianoOption, guitarOption, bassOption);
    $("#regionContent").append(region);
    $(region).width(app.musicLength * app.regionInterval);
    $(trackDiv).append(trackName, instrument);
    $("#tracksContent").append(trackDiv);

    app.music.user.addTrack(new Track(trackId, 'piano'));
    app.trackSelect(trackDiv);
}


app.deleteTrackListen = () => {
    $("#deleteTrack").click(() => {
        const selectedTrack = $(".track.selected");
        app.music.user.deleteTrack(selectedTrack.attr('trackId'));
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
        app.music.user.tracks[trackId].instrument = instrument;
    });
};

