/* global app $ */

app.clickCommitListen = () => {
    $("#tracksContent").on("click", ".version-commit", async function () {
        const trackId = parseInt($(this).parent().parent().attr("trackId"));
        const versions = app.music[app.userId].getVersions(trackId);
        let version = 1;
        if (versions.length > 0) {
            version = versions[versions.length - 1].version + 1;
        }
        const check = confirm("Commit Check");
        if(!check)
            return;
        const name = prompt("fill version name", `version${version}`);
        try {
            const res = await app.fetchData(`/api/1.0/midi/track/${trackId}`, {
                roomId: app.roomId,
                userId: app.userId,
                name,
                notes: app.music[app.userId].getNotes(trackId)
            }, "PUT");
            if (res.error) {
                alert("Failed: " + res.error);
                return;
            }
            alert("Success");
        }
        catch (e) {
            alert("Commit failed");
        }
    });
};

app.versionChangeListen = () => {
    $("#tracksContent").on("change", ".version-select", async function () {
        const version = $(this).val();
        const trackId = $(this).closest(".track").attr("trackId");
        const result = await fetch(`/api/1.0/midi/track?trackId=${trackId}&version=${version}`).then(res => res.json());
        if(!result.eror){
            app.music[app.userId].setNotes(result.trackId, result.notes);
            if(parseInt($(".track.selected").attr("trackId")) === parseInt(result.trackId)){
                app.panelLoadTrack(result.trackId);
            }
        }
    });
};

app.addTrack = async () => {
    try {
        await app.fetchData("http://localhost:3000/api/1.0/midi/track", {
            roomId: app.roomId,
            userId: app.userId
        }, "POST");
    }
    catch (e) {
        console.log(e);
    }
};


app.deleteTrackListen = () => {
    $("#deleteTrack").click(async() => {
        const selectedTrack = $(".track.selected");
        const deleteId = parseInt(selectedTrack.attr("trackId"));
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const res = await app.fetchData(`/api/1.0/midi/track/${deleteId}`, data, "Delete");
        if(res.error){
            alert(res.error);
            return;
        }
    });
};

app.lockClickListen = () => {
    $("#tracksContent").on("click", ".track-lock", async function () {
        const trackId = $(this).closest(".track").attr("trackId");
        const data = {
            userId: app.userId,
            roomId: app.roomId
        };
        const res = await app.fetchData(`/api/1.0/midi/track/${trackId}`, data, "PATCH");
        if(res.error){
            alert(res.error);
            return;
        }
    });
};