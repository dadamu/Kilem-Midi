/* global $ app */
app.rulerScaleRender = async(init, length, interval) => {
    const rulerScale = $("#rulerScale");
    for (let i = 0; i < length; i++) {
        const scaleNum = (init + i * interval).toString();
        let scale;
        if (i !== length - 1) {
            scale = $("<span></span>").css("left", scaleNum).addClass("scale").text((i + 1).toString());
        }
        $(rulerScale).append(scale);
    }
    $("#ruler").width((length - 1) * interval);
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

    const regionWidth = (app.musicLength - 1) * app.scaleInterval;
    const region = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId).width(regionWidth);
    $("#regionContent").append(region);

    $(track).append(trackName);
    $("#tracksContent").append(track);
    app.trackSelect(track);
    app.trackSelectListen();
}

app.deleteTrackListen = () => {
    $("#deleteTrack").click(() => {
        $(".track.selected").remove();
        $(".region.selected").remove();
    });
};

app.trackSelectListen = () => {
    $(".track").click(function () {
        app.trackSelect(this);
    });
    $(".region").click(function () {
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
    $("#midiPanel #trackName").text(trackName)
};



