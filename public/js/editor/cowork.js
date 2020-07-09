/* global app $ */

app.clickCommitListen = () => {
    $("#tracksContent").on("click", ".version-commit", async function () {
        const trackId = parseInt($(this).parent().parent().attr("trackId"));
        const versions = app.music[app.userId].getVersions(trackId);
        let version = 1;
        if (versions.length > 0) {
            version = versions[versions.length - 1].version + 1;
        }
        const versionName = prompt("fill version name", `version${version}`);
        try {
            const res = await app.postData("http://localhost:3000/api/1.0/midi/commit", {
                type: "commitTrack",
                roomId: app.roomId,
                userId: app.userId,
                name: versionName,
                trackId,
                notes: app.music[app.userId].getNotes(trackId)
            });
            if (res.error) {
                alert("Failed: " + res.error);
                return;
            }
            alert("Success");
        }
        catch (e) {
            alert("commit failed");
        }
    });
};

app.versionChangeListen = () => {
    $("#tracksContent").on("change", ".version-select", async function () {
        const version = $(this).val();
        const trackId = $(this).parent().parent().attr("trackId");
        const roomId = app.roomId;
        const result = await fetch(`/api/1.0/midi/pull?roomId=${roomId}&trackId=${trackId}&version=${version}`).then(res => res.json());
        if(!result.eror){
            app.music[app.userId].setNotes(result.trackId, result.notes);
            if(parseInt($(".track.selected").attr("trackId")) === parseInt(result.trackId)){
                app.panelLoadTrack(result.trackId);
            }
        }
    });
};