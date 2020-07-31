/* global $ app */

app.midiPanelListen = () => {
    app.openMidiPanelListen();
    app.clickKeysListen();
    app.midiPlayheadDragListen();
    app.regionPlayheadDragListen();
    app.panelCancelListen();
};

app.openMidiPanelListen = () => {
    $("#midiPanelButton").click(() => {
        if ($("#midiPanel").hasClass("hidden")) {
            const trackId = $(".track.selected").attr("trackId");
            if(!trackId){
                app.errorShow("Please select a track");
                return;
            }
            $("#midiPanelButton").addClass("active");
            $("#midiPanel").removeClass("hidden");
            app.panelLoadTrack(trackId);
            app.activeKeyRender(app.music.tracks[trackId].instrument);
            app.isMidiEditorOpen = true;
            app.setCurrentPlayhead(app.currentTime);
        }
        else {
            $("#midiPanel").addClass("hidden");
            $("#midiPanelButton").removeClass("active");
            app.isMidiEditorOpen = false;
        }
    });
};

app.openMidiPanel = () => {
    if ($("#midiPanel").hasClass("hidden")) {
        $("#midiPanelButton").addClass("active");
        const trackId = $(".track.selected").attr("trackId");
        $("#midiPanel").removeClass("hidden");
        app.panelLoadTrack(trackId);
        app.activeKeyRender(app.music.tracks[trackId].instrument);
        app.isMidiEditorOpen = true;
        app.setCurrentPlayhead(app.currentTime);
    }
};

app.activeKeyRender = (instrument) => {
    const curr = app.instruments[instrument];
    $(".key.inactive").removeClass("inactive");
    const activeKeys = $(".key").filter(function () {
        return $(this).attr("pitch") < curr.minPitch || $(this).attr("pitch") > curr.maxPitch;
    });
    activeKeys.addClass("inactive");
    const y = app.pitchHeight * ( app.keysNum + 25 - curr.maxPitch );
    $("#midiPanel .keys-and-grid").animate({
        scrollTop: y
    }, 0);
};

app.regionPlayheadDragListen = () => {
    $("#regionPlayhead .drag").draggable({
        axis: "x",
        start: () => {
            const currentTime = app.currentTime;
            const intervalX = app.regionInterval;
            this.initialX = intervalX * app.music.bpm / 4 * currentTime / 60 / 1000;
        },
        drag: (evt, ui) => {
            const max = app.gridsInterval * app.musicLength;
            let curr = ui.position.left + this.initialX;
            if (curr < 0) {
                curr = 0;
                return;
            }
            if (curr > max) {
                curr = max;
                return;
            }
            app.currentTime = curr / app.music.bpm / app.regionInterval * 60 * 1000 * 4;
            app.regionPlayheadTrans(app.music.bpm);
            if ($("#midiPanel").hasClass("hidden"))
                return;
            app.midiPlayheadTrans(app.music.bpm);
        },
        stop: (evt) => {
            $(evt.target).css("left", 0).css("top", 0);
        }
    });
};

app.midiPlayheadDragListen = () => {
    $("#midiPlayhead .drag").draggable({
        axis: "x",
        start: () => {
            const currentTime = app.currentTime;
            const intervalX = app.gridsInterval;
            this.initialX = intervalX * app.music.bpm / 4 * currentTime / 60 / 1000;
        },
        drag: (evt, ui) => {
            const max = app.gridsInterval * app.musicLength;
            let curr = ui.position.left + this.initialX;
            if (curr < 0) {
                curr = 0;
                return;
            }
            if (curr > max) {
                curr = max;
                return;
            }
            app.currentTime = curr / app.music.bpm / app.gridsInterval * 60 * 1000 * 4;
            app.midiPlayheadTrans(app.music.bpm);
            app.regionPlayheadTrans(app.music.bpm);
        },
        stop: (evt) => {
            $(evt.target).css("left", 0).css("top", 0);
        }
    });
};

app.panelLoadTrack = (trackId) => {
    $("#grids .note").remove();
    if (!$("#midiPanel").hasClass("hidden")) {
        $("#midiPanel").attr("trackId", trackId);
        if (app.music.tracks[trackId]) {
            for (let [posX, notes] of Object.entries(app.music.tracks[trackId].notes)) {
                app.notesRender(posX, notes);
            }
        }
    }
};

app.setCurrentPlayhead = (current) => {
    const intervalX = app.gridsInterval;
    const { bpm } = app.music;
    const currentX = intervalX / 4 * bpm * current / 60 / 1000;
    $("#midiPlayhead").css("-webkit-transform", `translateX(${currentX}px)`);
};

app.clickKeysListen = () => {
    $("#keys").on("click", ".key", async function () {
        const trackId = $("#midiPanel").attr("trackId");
        const { instrument } = app.music.tracks[trackId];
        const target = this;
        const pitch = $(target).attr("pitch");
        app.playNote(instrument, pitch);
        return;
    });
};

app.panelCancelListen = () => {
    $("#panelCancel").click(() => {
        $("#midiPanel").addClass("hidden");
        $("#midiPanelButton").css("background", "inherit");
        app.isMidiEditorOpen = false;
    });
};

app.initSvgGrids = async () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    const pitchHeight = app.pitchHeight;
    const musicLength = app.musicLength;
    const keysNum = app.keysNum;
    const grids = $("#grids");
    $("#midiPlayhead").height(keysNum * pitchHeight);
    grids.width(gridsWidth).height(keysNum * pitchHeight);
    const svg = app.midiSvgGrid(app.gridsInterval, pitchHeight, keysNum, musicLength);
    grids.html(svg);
    return;
};

app.initKeysRender = () => {
    let keysHtml = "";
    for (let i = app.scaleNumMax; i >= app.scaleNumMin; i--) {
        keysHtml += app.midiKeysTemplate(i);
    }
    $("#keys").html(keysHtml);
    return;
};

app.initGridsRender = () => {
    const gridsWidth = app.gridsInterval * app.musicLength;
    $("#grids").width(gridsWidth);
    return;
};

