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
            .select(["r.bpm AS bpm", "r.file_name AS fileName", "u1.id AS creatorId", "u1.username AS creatorName", "u2.id AS commiterId", "u2.username AS commiterName",
                "t.track_id AS trackId", "t.name AS trackName", "v.version AS version", "v.notes AS notes", "t.instrument AS instrument", "t.lock AS lock"])
            .innerJoin("track AS t", "t.room_id", "r.id")
            .leftJoin("version AS v", "t.id", "v.track_pid")
            .innerJoin("user AS u1", "u1.id", "t.user_id")
            .leftJoin("user AS u2", "u2.id", "v.user_id")
            .where("r.id", roomId).andWhere("active", 1);
        const masterData = getMasterData(selectMaster);
        return { user: JSON.parse(userData[0].data), master: masterData };
    },
    addTrack: async (body) => {
        const { roomId, userId } = body;
        const trx = await knex.transaction();
        let id = 0;
        let name = "";
        try {
            const select = await trx("track").select(["track_id"]).innerJoin("room", "track.room_id", "room.id").where("room.id", roomId).forUpdate();
            id = select.length + 1;
            name = `Track${id}`;
            await trx("track").insert({
                name,
                user_id: userId,
                room_id: roomId,
                track_id: id
            });
            await trx.commit();
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
        return { id, name };
    }
};

function getMasterData(data) {
    const result = {};
    result.bpm = data[0].bpm;
    result.fileName = data[0].fileName;
    result.tracks = {};
    const trackMap = {};
    const versionsMap = [];
    data.forEach(track => {
        const { trackId } = track;
        if (trackMap[trackId]) {
            if (trackMap[trackId].version < track.version) {
                trackMap[trackId] = track;
            }
            versionsMap[trackId].push(track.version);
        }
        else {
            trackMap[trackId] = track;
            versionsMap[trackId] = [track.version];
        }
    });
    for (let track of Object.values(trackMap)) {
        const { trackId } = track;
        result.tracks[trackId] = {};
        result.tracks[trackId].id = track.trackId;
        result.tracks[trackId].name = track.trackName;

        result.tracks[trackId].creator = { id: track.creatorId, name: track.creatorName };
        if( result.tracks[trackId].commiter )
            result.tracks[trackId].commiter = { id: track.commiterId, name: track.commiterName };
        else{
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