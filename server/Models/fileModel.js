const knex = require("../../util/mysqlCon").knex;
module.exports = {
    saveFile: async (body) => {
        const { roomId, userId, data } = body;
        await knex("save").update({
            data: JSON.stringify(data)
        }).where("room_id", roomId).andWhere("user_id", userId);
        return;
    },
    getFile: async (roomId, userId) => {
        const userData = await knex("save").select(["data"]).where("room_id", roomId).andWhere("user_id", userId);
        const selectMaster = await knex("room AS r")
            .select(["r.bpm AS bpm", "r.file_name AS fileName", "u1.id AS creatorId", "u1.username AS creatorName", "u2.id AS commiterId", "u2.username AS commiterName", "t.active AS active",
                "t.track_id AS trackId", "t.name AS trackName", "v.version AS version", "v.name AS versionName", "v.notes AS notes", "t.instrument AS instrument", "t.lock AS lock"])
            .leftJoin("track AS t", "t.room_id", "r.id")
            .leftJoin("version AS v", "t.id", "v.track_pid")
            .leftJoin("user AS u1", "u1.id", "t.user_id")
            .leftJoin("user AS u2", "u2.id", "v.user_id")
            .where("r.id", roomId);
        const masterData = getMasterData(selectMaster);
        return { user: JSON.parse(userData[0].data), master: masterData };
    }
};


function getMasterData(data) {
    const result = {};
    result.bpm = data[0].bpm;
    result.fileName = data[0].fileName;
    result.tracks = {};
    const trackMap = {};
    const versionsMap = [];
    // create Map
    data.forEach(track => {
        const { trackId } = track;
        if (trackMap[trackId]) {
            if (trackMap[trackId].version < track.version) {
                trackMap[trackId] = track;
            }
            versionsMap[trackId].push({ version: track.version, name: track.versionName });
        }
        else {
            trackMap[trackId] = track;
            if (track.version) {
                versionsMap[trackId] = [{ version: track.version, name: track.versionName }];
            }
            else {
                versionsMap[trackId] = [];
            }
        }
    });
    for (let track of Object.values(trackMap)) {
        const { trackId } = track;
        if (!trackId) {
            result.tracks = {};
            return result;
        }
        if(!track.active)
            continue;
        result.tracks[trackId] = {};
        result.tracks[trackId].id = track.trackId;
        result.tracks[trackId].name = track.trackName;

        result.tracks[trackId].creator = { id: track.creatorId, name: track.creatorName };
        if (result.tracks[trackId].commiter)
            result.tracks[trackId].commiter = { id: track.commiterId, name: track.commiterName };
        else {
            result.tracks[trackId].commiter = {};
        }

        result.tracks[trackId].instrument = track.instrument;
        result.tracks[trackId].notes = JSON.parse(track.notes) || {};

        result.tracks[trackId].lock = track.lock;
        result.tracks[trackId].version = track.version || 0;
        result.tracks[trackId].versions = versionsMap[trackId];
    }
    return result;
}