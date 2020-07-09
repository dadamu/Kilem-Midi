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
            .select(["r.bpm AS bpm", "r.file_name AS fileName", "u1.id AS creatorId", "u1.username AS creatorName", "u2.id AS commiterId", "u2.username AS commitorName",
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
        const { roomId, userId, name } = body;
        const trx = await knex.transaction();
        let trackId = 0;
        try {
            const select = await trx("track").select(["track_id"]).innerJoin("room", "track.room_id", "room.id").where("room.id", roomId).forUpdate();
            trackId = select.length + 1;
            await trx("track").insert({
                name: name || "New Track",
                user_id: userId,
                room_id: roomId,
                track_id: trackId
            });
            await trx.commit();
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
        return trackId;
    }
};

function getMasterData(data) {
    const result = {};
    result.bpm = data[0].bpm;
    result.fileName = data[0].fileName;
    result.tracks = {};
    let map = {};
    data.forEach(track => {
        const { trackId } = track;
        if (map[trackId]) {
            if (map[trackId].version < track.version) {
                map[trackId] = track;
            }
        }
        else {
            map[trackId] = track;
        }
    });
    for (let track of Object.values(map)) {
        const { trackId } = track;
        result.tracks[trackId] = {};
        result.tracks[trackId].id = track.trackId;
        result.tracks[trackId].name = track.trackName;
        result.tracks[trackId].creatorId = track.creatorId;
        result.tracks[trackId].creatorName = track.creatorName;
        result.tracks[trackId].commitorId = track.commitorId;
        result.tracks[trackId].commitorName = track.commitorName;
        result.tracks[trackId].version = track.version;
        result.tracks[trackId].instrument = track.instrument;
        result.tracks[trackId].notes = JSON.parse(track.notes);
        result.tracks[trackId].lock = track.lock;
    }
    return result;
}