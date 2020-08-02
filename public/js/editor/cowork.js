/* global app $ Swal */

app.clickCommitListen = () => {
    $("#tracksContent").on("click", ".version-commit", async function () {
        const trackId = parseInt($(this).parent().parent().attr("trackId"));
        const versions = app.music.getTrack(trackId).get("versions");
        let version = 1;
        if (versions.length > 0) {
            version = versions[versions.length - 1].version + 1;
        }
        const swal = await Swal.fire({
            title: "Submit version name",
            icon: "info",
            input: "text",
            inputValue: `version${version}`,
            showCancelButton: true,
            preConfirm: (name) => {
                return app.fetchData(`/api/1.0/midi/track/${trackId}`, {
                    roomId: app.roomId,
                    userId: app.userId,
                    name,
                    notes: app.music.getTrack(trackId).get("notes")
                }, "PUT");
            }
        });
        if (swal.isDismissed)
            return;
        const res = swal.value;
        if (res.error === "lock failed") {
            app.failedByLock();
            return;
        }
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        app.successShow("Saved");
    });
};

app.versionChangeListen = () => {
    $("#tracksContent").on("change", ".version-select", async function () {
        const version = $(this).val();
        const trackId = $(this).closest(".track").attr("trackId");
        const result = await fetch(`/api/1.0/midi/track?trackId=${trackId}&version=${version}`).then(res => res.json());
        if (result.error) {
            app.errorShow(result.error);
            return;
        }
        app.music.getTrack(result.trackId).set("notes", result.notes);
        if (parseInt($("#midiPanel").attr("trackId")) === parseInt(result.trackId)) {
            app.panelLoadTrack(result.trackId);
        }
        app.loadRegionNotesRender(result.trackId);
        app.successShow("Version changed");
        app.saveFile();
    });
};

app.addTrack = async () => {
    try {
        await app.fetchData("/api/1.0/midi/track", {
            roomId: app.roomId,
            userId: app.userId
        }, "POST");
        app.successShow("Track added");
    }
    catch (e) {
        app.errorShow(e.message);
    }
};

app.addTrackListen = () => {
    $("#addTrack").click(() => {
        app.addTrack();
    });
};

app.deleteTrackListen = () => {
    $("#deleteTrack").click(async () => {
        const swal = await Swal.fire({
            icon: "warn",
            text: "Really remove track?",
            showCancelButton: true
        });
        if (swal.isDismissed) {
            return;
        }
        const selectedTrack = $(".track.selected");
        const deleteId = parseInt(selectedTrack.attr("trackId"));
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const res = await app.fetchData(`/api/1.0/midi/track/${deleteId}`, data, "Delete");
        if(res.error === "lock failed"){
            app.failedByLock();
            return;
        }
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        app.successShow("Track removed");
    });
};

app.lockClickListen = () => {
    $("#tracksContent").on("click", ".lock-icon", async function () {
        const trackId = $(this).closest(".track").attr("trackId");
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const version = app.music.getTrack(trackId).get("version");
        const locker = app.music.getTrack(trackId).get("locker");
        if (locker.id === app.userId) {
            const isDiffer = await app.checkDifferFromLatest(trackId, version);
            if (isDiffer) {
                app.errorShow("Please Save Change First");
                return;
            }
        }
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/lock`, data, "PATCH");
        if (res.error === "lock failed") {
            app.failedByLock();
            return;
        }
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        app.successShow("Lock Changed");
    });
};


app.checkDifferFromLatest = async (id, version) => {
    const current = app.music.getTrack(id).get("notes");
    let previous;
    if (version) {
        const latest = await fetch(`/api/1.0/midi/track?trackId=${id}&version=${version}`).then(res => res.json());
        previous = latest.notes;
    }
    else {
        previous = {};
    }
    if (JSON.stringify(previous) !== JSON.stringify(current)) {
        return true;
    }
    return false;
};

app.changeInstrumentListen = () => {
    $(".tracks-title").on("change", ".instrument-selector", async function () {
        const trackId = $(this).closest(".track").attr("trackId");
        const instrument = $(this).val();
        const roomId = app.roomId;
        const userId = app.userId;
        const data = {
            roomId,
            userId,
            instrument
        };
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/instrument`, data, "PATCH");
        const originInstrument = app.music.getTrack(trackId).get("instrument");
        if (res.error === "lock failed") {
            app.failedByLock();
            $(`.track.track-${trackId} .instrument-selector`).val(originInstrument);
            return;
        }
        if (res.error) {
            app.errorShow(res.error);
            $(`.track.track-${trackId} .instrument-selector`).val(originInstrument);
            return;
        }
    });
};

app.coworkListen = () => {
    app.addTrackListen();
    app.changeInstrumentListen();
    app.lockClickListen();
    app.deleteTrackListen();
    app.clickCommitListen();
    app.versionChangeListen();
};