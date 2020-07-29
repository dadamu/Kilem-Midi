/* global app $ Swal */

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

        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}`, {
            roomId: app.roomId,
            userId: app.userId,
            name,
            notes: app.music.getNotes(trackId)
        }, "PUT");
        if (res.error === "It's not your locked track") {
            Swal.fire({
                title: "Failed",
                icon: "error",
                html: `
                    <br>
                    <img style='display: block;border: 1px #FFF solid; width: 90%; margin: auto;' src='/public/img/sample/check-lock.jpg' />
                    <div style='padding-left:20px; margin-top: 20px;'>You only can edit yourself's track, Check Track status first.</div>
                    `
            });
            return;
        }
        if (res.error) {
            app.errorShow(res.error);
            return;
        }
        app.successShow("Save Success");
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
        app.music.setNotes(result.trackId, result.notes);
        if (parseInt($(".track.selected").attr("trackId")) === parseInt(result.trackId)) {
            app.panelLoadTrack(result.trackId);
        }
        app.loadRegionNotesRender(result.trackId);
        app.successShow("Version Change Success");
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
        const version = app.music.getVersion(trackId);
        let previous;
        if (version) {
            const get = await fetch(`/api/1.0/midi/track?trackId=${trackId}&version=${version}`).then(res => res.json());
            previous = get.notes;
        }
        else {
            previous = {};
        }
        if (JSON.stringify(previous) !== JSON.stringify(current)) {
            app.errorShow("Please Save Change First");
            return;
        }

        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}/lock`, data, "PATCH");
        if (res.error === "It's not your locked track") {
            Swal.fire({
                title: "Failed",
                icon: "error",
                html: `
                    <br>
                    <img style='display: block;border: 1px #FFF solid; width: 90%; margin: auto;' src='/public/img/sample/check-lock.jpg' />
                    <div style='padding-left:20px; margin-top: 20px;'>You only can Edit yourself's track, Check Track status first.</div>
                    `
            });
            return;
        }
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