/* global app $ */

app.controlListen = () => {
    app.exitListen();
    app.midiPlayListen();
    app.midiStopListen();
    app.midiResetListen();
    app.filenameChangeListen();
    app.bpmChangeListen();
    app.loopControlListen();
    app.inviteButtonListen();
    app.loopButtonListen();
    app.iconParentHoverListen();
};

app.iconParentHoverListen = () => {
    $("body").on("mouseenter", ".icon-container", function () {
        $(this).children().addClass("hover");
    });

    $("body").on("mouseleave", ".icon-container", function () {
        $(this).children().removeClass("hover");
    });

};

app.exitListen = () => {
    $("#exit").click(() => {
        window.location.href = "/room";
    });
};

app.midiPlayListen = () => {
    $("#playButton").click(function () {
        if (app.isplaying) {
            clearInterval(app.playInterval);
            app.isplaying = false;
            $(this).removeClass("active");
            $(this).find("i").removeClass("fas fa-pause").addClass("fas fa-play");
            return;
        }
        app.midiPlay();
        $(this).find("i").removeClass("fas fa-play").addClass("fas fa-pause");
        $(this).addClass("active");
    });
};

app.loopButtonListen = () => {
    $("#loopButton").click(function () {
        if (!app.islooping) {
            $("#loopControl").removeClass("inactive");
            app.islooping = true;
            $(this).addClass("active");
            return;
        }
        $("#loopControl").addClass("inactive");
        app.islooping = false;
        $(this).removeClass("active");
    });
};

app.midiPlay = () => {
    if (!app.isplaying) {
        const bpm = app.music.get("bpm");
        const resolution = 60 /bpm / 16 * 1000;
        const tracks = app.music.get("tracks");
        app.isplaying = true;
        const maxTime = app.musicLength * 4 / (bpm / 60) * 1000;
        app.playInterval = setInterval(() => {
            if (app.currentTime >= maxTime) {
                clearInterval(app.playInterval);
                app.isplaying = false;
            }
            if (app.islooping && (app.currentTime >= app.loopend && app.currentTime <= app.loopend + resolution * 2)) {
                app.currentTime = app.loopstart;
            }

            app.regionPlayheadTrans(bpm);
            if (app.isMidiEditorOpen) {
                app.midiPlayheadTrans(bpm);
            }
            app.playTracks(bpm, tracks);
            app.currentTime += resolution;
        }, resolution);
    }
};

app.playTracks = (bpm, tracks) => {
    for (let id in tracks) {
        app.playTrack(bpm, tracks[id]);
    }
};

app.regionPlayheadTrans = (bpm) => {
    const currentTime = app.currentTime;
    const intervalX = app.regionInterval;
    const playOffset = intervalX * bpm / 4 * currentTime / 60 / 1000;
    $("#regionPlayhead").css("-webkit-transform", `translateX(${playOffset}px)`);
};

app.midiPlayheadTrans = (bpm) => {
    const currentTime = app.currentTime;
    const intervalX = app.gridsInterval;
    const playOffset = intervalX * bpm / 4 * currentTime / 60 / 1000;
    $("#midiPlayhead").css("-webkit-transform", `translateX(${playOffset}px)`);
};

app.midiStopListen = () => {
    $("#stopButton").click(() => {
        clearInterval(app.playInterval);
        app.isplaying = false;
        app.currentTime = 0;
        const bpm = app.music.get("bpm");
        app.regionPlayheadTrans(bpm);
        app.midiPlayheadTrans(bpm);
        $("#playButton").removeClass("active");
        $("#playButton i").removeClass("fas fa-pause").addClass("fas fa-play");
    });
};

app.midiResetListen = () => {
    $("#resetButton").click(() => {
        app.currentTime = app.loopstart;
        const bpm = app.music.get("bpm");
        app.regionPlayheadTrans(bpm);
        app.midiPlayheadTrans(bpm);
    });
};

app.setPlayingTracks = () => {
    return JSON.parse(JSON.stringify(app.tracks));
};

app.playTrack = (bpm, track) => {
    const posX = Math.floor(app.currentTime / (60 / bpm * 1000) * 16);
    if (track.notes[posX]) {
        app.playTrackNotes(bpm, track.instrument, track.notes[posX]);
    }
};

app.playTrackNotes = (bpm, instrument, notes) => {
    for (let note of notes) {
        if (app.instruments[instrument].audio[note.pitch]) {
            const source = app.audioCtx.createBufferSource();
            const { buffer, pitchShift } = app.instruments[instrument].audio[note.pitch];
            source.buffer = buffer;
            if (pitchShift) {
                source.detune.value = pitchShift * 100;
            }
            const time = (1 / (bpm / 60)) * (4 * note.length);
            app.fadeAudio(source, time);
        }
    }
};


app.fadeAudio = function (source, time) {
    const currentTime = app.audioCtx.currentTime;
    const gain = app.audioCtx.createGain();
    gain.gain.linearRampToValueAtTime(0, currentTime + time * 120 / 100);

    source.connect(gain);
    gain.connect(app.audioCtx.destination);
    source.start(0);
    source.stop(currentTime + time);
};


app.filenameRender = () => {
    $("#filename").val(app.filename);
    if (app.creator.id === app.userId) {
        $("#filename").removeAttr("disabled").addClass("editable");
    }
};

app.roomnameRender = () => {
    $("#roomname").text(app.roomname);
    if (app.creator.id === app.userId) {
        $("#roomname").removeAttr("disabled");
    }
};

app.filenameChangeListen = () => {
    $("#filename").change(async function () {
        const res = await app.fetchData(`/api/1.0/midi/file/${app.roomId}/filename`, {
            filename: $(this).val(),
            userId: app.userId
        }, "PATCH");
        if (res.error) {
            app.errorShow(res.error);
            app.filenameRender(app.filename);
            return;
        }
        app.filename = $(this).val();
        app.successShow("Filename changed");
    });
};


app.bpmChangeListen = () => {
    $("#bpm").change(async function () {
        const bpm = $(this).val();
        if (bpm > 200 || bpm < 60) {
            app.bpmRender(app.music.get("bpm"));
            app.errorShow("bpm should be between 60 and 200.");
            return;
        }
        const res = await app.fetchData(`/api/1.0/midi/file/${app.roomId}/bpm`, {
            bpm,
            userId: app.userId
        }, "PATCH");
        if (res.error) {
            app.errorShow(res.error);
            app.bpmRender(app.music.get("bpm"));
            return;
        }
        app.successShow("Bpm Change Success");
        app.music.set("bpm", $(this).val());
    });
};

app.bpmRender = () => {
    $("#bpm").val(app.music.get("bpm"));
    if (app.creator.id === app.userId) {
        $("#bpm").removeAttr("disabled").addClass("editable");
    }
};

app.controlRulerRender = () => {
    const grid = app.rulerSvgGrid(app.regionInterval, app.musicLength);
    $("#rulerControl").append(grid);
};

app.controlLoopRender = () => {
    app.loopstart = 0;
    app.loopend = app.posToTime(4 * app.regionInterval, app.regionInterval);
    $("#loopControl").width(app.regionInterval * 4).height("100%");
    app.setLoopHeadDrag($("#loopControl .head"));
    app.setLoopTailDrag($("#loopControl .tail"));
};

app.posToTime = (pos, interval) => {
    return pos * 4 / interval * 60 / app.music.get("bpm") * 1000;
};

app.setLoopHeadDrag = (div) => {
    div.draggable({
        axis: "x",
        start: () => {
            let start = $("#loopControl").css("left");
            let oWidth = $("#loopControl").width();
            this.start = parseFloat(start.replace("px", ""));
            this.oWidth = oWidth;
        },
        drag: (evt) => {
            let curr = evt.pageX + $("#tracksRegion").scrollLeft() - $("#tracksRegion").offset().left;
            const resolution = app.regionInterval / 4;
            this.width;
            if (curr <= 0) {
                curr = 0;
            }
            let widthChange = this.start - curr;
            curr = Math.round(curr / resolution) * resolution;
            if (Math.abs(widthChange) >= resolution) {
                this.width = Math.round(widthChange / resolution) * resolution + this.oWidth;
            }
            else if (curr === 0) {
                this.width = this.oWidth;
            }
            else {
                this.width = resolution + this.oWidth;
            }

            if (curr > this.start + this.oWidth - resolution) {
                $("#loopControl").width(resolution);
                return;
            }
            $("#loopControl").width(this.width);
            $("#loopControl").css("left", curr);
        },
        stop: (evt) => {
            $(evt.target).css("left", 0).css("top", 0);
            let start = $("#loopControl").css("left");
            $("#loopControl .tail").css("left", parseInt(this.width) - 10).css("top", 0);
            start = start.replace("px", "");
            app.loopstart = app.posToTime(start, app.regionInterval);
        }
    });
};

app.setLoopTailDrag = (div) => {
    div.draggable({
        axis: "x",
        drag: (evt) => {
            let start = $("#loopControl").css("left");
            start = parseFloat(start.replace("px", ""));
            const curr = evt.pageX + $("#tracksRegion").scrollLeft() - $("#tracksRegion").offset().left;
            let width = curr - start;
            const resolution = app.regionInterval / 4;
            if (width > resolution) {
                this.width = Math.round(width / resolution) * resolution;
                $("#loopControl").width(this.width);
                return;
            }
            const max = app.musicLength * app.regionInterval;
            if (width >= max) {
                this.width = max;
                $("#loopControl").width(max);
                return;
            }
            this.width = resolution;
        },
        stop: (evt) => {
            $(evt.target).css("left", parseInt(this.width) - 10).css("top", 0);
            $("#loopControl head").css("left", 0). css("top", 0);
            let start = $("#loopControl").css("left");
            start = parseFloat(start.replace("px", ""));
            const end = start + this.width;
            app.loopend = app.posToTime(end, app.regionInterval);
        }
    });
};

app.loopControlListen = () => {
    $("#rulerControl").on("dblclick", "#loopControl", function () {
        if ($(this).hasClass("inactive")) {
            $(this).removeClass("inactive");
            app.islooping = true;
            $("#loopButton").addClass("active");
            return;
        }
        $(this).addClass("inactive");
        app.islooping = false;
        $("#loopButton").removeClass("active");
    });

    $("#rulerGirds").mousedown(function (evt) {
        $("#loopControl").remove();
        const x = evt.pageX + $("#tracksRegion").scrollLeft() - $("#tracksRegion").offset().left;
        const resolution = app.regionInterval / 4;
        const start = Math.round(x / resolution) * resolution;
        const newLoop = $("<div></div>").attr("id", "loopControl").addClass("loop-control").css("left", start).height("100%").width(resolution);
        if (!app.islooping) {
            newLoop.addClass("inactive");
        }
        $("#rulerControl").append(newLoop);

        $("#tracksRegion").bind("mousemove", function (evt) {
            const x = evt.pageX + $("#tracksRegion").scrollLeft() - $("#tracksRegion").offset().left;
            const resolution = app.regionInterval / 4;
            const current = Math.round(x / resolution) * resolution;
            let width = Math.abs(current - start);
            if(Math.abs(current - start) < resolution){
                width = resolution;
            }
            if (current - start < 0) {
                $("#loopControl").width(width).css("left", current);
                return;
            }
            $("#loopControl").width(width).css("left", start);
        });
    });
    $("body").mouseup(function () {
        $("#tracksRegion").unbind("mousemove");
        if ($("#loopControl").children().length > 0)
            return;

        let start = $("#loopControl").css("left");
        start = parseFloat(start.replace("px", ""));
        const width = $("#loopControl").width();
        const end = start + width;
        app.loopstart = app.posToTime(start, app.regionInterval);
        app.loopend = app.posToTime(end, app.regionInterval);

        const tail = $("<div class='tail'></div>");
        const head = $("<div class='head'></div>");
        $("#loopControl").append(head, tail);
        app.setLoopHeadDrag(head);
        app.setLoopTailDrag(tail);
    });
};

app.inviteButtonListen = () => {
    $("#invite").click(function () {
        app.successShow("URL Copied");
        const url = $("<input></input>");
        let host = window.location.protocol + "//" + window.location.hostname;
        if (window.location.hostname === "localhost") {
            host += ":" + window.location.port;
        }
        $(url).val(host + "/room?invite=" + app.roomId);
        $(this).parent().append(url);
        url.select();
        document.execCommand("copy");
        $(url).remove();
    });
};

app.initControlRender = () => {
    app.bpmRender();
    app.filenameRender();
    app.roomnameRender();
    app.controlRulerRender();
    app.controlLoopRender();
};