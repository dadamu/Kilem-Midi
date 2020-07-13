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
        const selectUser = await knex("save").select(["data"]).where("room_id", roomId).andWhere("user_id", userId);
        const selectMaster = await knex("room AS r")
            .select(["r.bpm AS bpm", "r.file_name AS fileName", "u1.id AS lockerId", "u1.username AS lockerName", "u2.id AS commiterId", "u2.username AS commiterName", "t.active AS active",
                "t.id AS trackId", "t.name AS trackName", "v.version AS version", "v.name AS versionName", "v.notes AS notes", "t.instrument AS instrument"])
            .leftJoin("track AS t", "t.room_id", "r.id")
            .leftJoin("version AS v", "t.id", "v.track_id")
            .leftJoin("user AS u1", "u1.id", "t.user_id")
            .leftJoin("user AS u2", "u2.id", "v.user_id")
            .where("r.id", roomId);
        const userData = JSON.parse(selectUser[0].data);
        const masterData = getMasterData(selectMaster);
        const data = merge(userData, masterData);
        return data;
    },
    update: async (trackId, body) => {
        const { type, roomId, userId, note } = body;
        const trx = await knex.transaction();
        try {
            const select = await trx("save").select(["data AS data"]).where("user_id", userId).andWhere("room_id", roomId).forUpdate();
            const { data } = select[0];
            const tracks = JSON.parse(data);
            if (type === "createNote") {
                if (tracks[trackId].notes[note.posX]) {
                    tracks[trackId].notes[note.posX].push(note);
                }
                else{
                    tracks[trackId].notes[note.posX] = [ note ];
                }
            }
            await trx("save").update({
                data: JSON.stringify(tracks)
            }).where("room_id", roomId).andWhere("user_id", userId);
            await trx.commit();
            return note;
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};


function merge(user, master) {
    if (Object.keys(master.tracks).length > 0) {
        for (let track of Object.values(user)) {
            const { id, version, notes, commiter, instrument } = track;
            const masterTrack = master.tracks[id];
            masterTrack.instrument = instrument;
            masterTrack.version = version;
            masterTrack.commiter = commiter;
            masterTrack.notes = notes;
        }
    }
    return master;
}

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
        if (!track.active)
            continue;
        result.tracks[trackId] = {};
        result.tracks[trackId].id = track.trackId;
        result.tracks[trackId].name = track.trackName;

        result.tracks[trackId].locker = { id: track.lockerId, name: track.lockerName };
        if (result.tracks[trackId].commiter)
            result.tracks[trackId].commiter = { id: track.commiterId, name: track.commiterName };
        else {
            result.tracks[trackId].commiter = {};
        }

        result.tracks[trackId].instrument = track.instrument;
        result.tracks[trackId].notes = JSON.parse(track.notes) || {};

        result.tracks[trackId].version = track.version || 0;
        result.tracks[trackId].versions = versionsMap[trackId];
    }
    return result;
}