const app = {};
app.trackNum = 0;
app.musicLength = 24;
app.scaleInterval = 100;

app.UIListen = () => {
    app.addTrackListen();
    app.deleteTrackListen();
    app.trackSelectListen();
};

app.render = ()=>{
    const pTasks = [];
    pTasks.push(app.rulerScaleRender(5, app.musicLength, app.scaleInterval));
    return Promise.all(pTasks);
};

app.rulerScaleRender = (init, length, interval) => {
    return new Promise((resolve, reject)=>{
        const rulerScale = $("#rulerScale");
        for(let i = 0; i < length; i++){
            const scaleNum = (init + i*interval).toString();
            let scale;
            if( i !== length-1){
                scale = $("<span></span>").css("left", scaleNum).addClass("scale").text((i+1).toString());
            }
            $(rulerScale).append(scale);
        }
        $("#ruler").width((length-1)*interval);
        resolve();
    });
}

app.addTrackListen = () => {
    $("#addTrack").click(() => {
        const trackId = ++app.trackNum;
        const track = $("<div></div>").addClass(`track track-${trackId}`).attr("trackId", trackId);
        const trackName = $("<div></div>").addClass("track-name").text("Track"+trackId);

        const regionWidth = (app.musicLength-1) * app.scaleInterval;
        const region = $("<div></div>").addClass(`region track-${trackId}`).attr("trackId", trackId).width(regionWidth);
        $("#regionContent").append(region);

        $(track).append(trackName);
        $("#tracksContent").append(track);
        app.trackSelectListen();
    });
};

app.deleteTrackListen = () => {
    $("#deleteTrack").click(() => {
        $(".track.selected").remove();
        $(".region.selected").remove();
    });
}

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
};

app.init = async() => {
    await app.render();
    app.UIListen();
};


$(document).ready(app.init);