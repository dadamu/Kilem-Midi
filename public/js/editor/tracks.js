/* global $ app */
app.initRulerRender = async() => {
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

app.initRegionRender = async()=>{
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
    const track = $("<div></div>").addClass(`track track-${trackId}`).attr("trackId", trackId);
    const trackName = $("<div></div>").addClass("track-name").text("Track" + trackId);
    const region = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId);
    $("#regionContent").append(region);
    $(region).width(app.musicLength * app.regionInterval);
    $(track).append(trackName);
    $("#tracksContent").append(track);

    app.tracks[trackId] = {};
    app.trackSelect(track);
}

app.deleteTrackListen = () => {
    $("#deleteTrack").click(() => {
        const selectedTrack = $(".track.selected");
        delete app.tracks[selectedTrack.attr('trackId')];
        selectedTrack.remove();
        $(".region.selected").remove();
        $(".track").last().addClass("selected");
        $(".region").last().addClass("selected");
        app.panelLoadTrack($(".region").last().attr("trackId"));
    });
};

app.trackSelectListen = () => {
    $("#tracksContent").on('click', '.track',function () {
        app.trackSelect(this);
    });
    $("#regionContent").on('click', '.region',function () {
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



