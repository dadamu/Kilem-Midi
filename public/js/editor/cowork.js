/* global app $ */

app.clickCommitListen = () => {
    $("#tracksContent").on("click", ".version-commit", async function () {
        const trackId = parseInt($(this).parent().parent().attr("trackId"));
        const versions = app.music.getVersions(trackId);
        let version = 1;
        if (versions.length > 0) {
            version = versions[versions.length - 1].version + 1;
        }
        const check = confirm("Commit Check");
        if (!check)
            return;
        const name = prompt("fill version name", `version${version}`);
        try {
            const res = await app.fetchData(`/api/1.0/midi/track/${trackId}`, {
                roomId: app.roomId,
                userId: app.userId,
                name,
                notes: app.music.getNotes(trackId)
            }, "PUT");
            if (res.error) {
                app.errorShow(res.error);
                return;
            }
            app.successShow("Save Success");
        }
        catch (e) {
            app.errorShow("Save failed");
        }
    });
};

app.versionChangeListen = () => {
    $("#tracksContent").on("change", ".version-select", async function () {
        const version = $(this).val();
        const trackId = $(this).closest(".track").attr("trackId");
        const result = await fetch(`/api/1.0/midi/track?trackId=${trackId}&version=${version}`).then(res => res.json());
        if (!result.error) {
            app.music.setNotes(result.trackId, result.notes);
            if (parseInt($(".track.selected").attr("trackId")) === parseInt(result.trackId)) {
                app.panelLoadTrack(result.trackId);
            }
            app.loadRegionNotesRender(result.trackId);
        }
    });
};

app.addTrack = async () => {
    try {
        await app.fetchData("/api/1.0/midi/track", {
            roomId: app.roomId,
            userId: app.userId
        }, "POST");
        app.successShow("Add Track Success");
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
        const selectedTrack = $(".track.selected");
        const deleteId = parseInt(selectedTrack.attr("trackId"));
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const res = await app.fetchData(`/api/1.0/midi/track/${deleteId}`, data, "Delete");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        app.successShow("Remove Track Success");
    });
};

app.lockClickListen = () => {
    $("#tracksContent").on("click", ".lock-icon", async function () {
        const trackId = $(this).closest(".track").attr("trackId");
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const current = app.music.tracks[trackId].notes;
        const version = app.music.getVersion(trackId).version;
        let previous;
        if (version) {
            const get = await fetch(`/api/1.0/midi/track?trackId=${trackId}&version=${version}`).then(res => res.json());
            previous = get.notes;
            if (JSON.stringify(current) !== JSON.stringify(previous)) {
                app.errorShow("Please commit change first");
                return;
            }
        }
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/lock`, data, "PATCH");
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
    });
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
        if (res.error) {
            app.errorShow(res.error);
            $(`.track.track-${trackId} .instrument-selector`).val(app.music.tracks[trackId].instrument);
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