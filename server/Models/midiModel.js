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
                "t.track_id AS trackId", "t.name AS trackName", "v.version AS version", "v.name AS versionName", "v.notes AS notes", "t.instrument AS instrument", "t.lock AS lock"])
            .leftJoin("track AS t", "t.room_id", "r.id")
            .leftJoin("version AS v", "t.id", "v.track_pid")
            .leftJoin("user AS u1", "u1.id", "t.user_id")
            .leftJoin("user AS u2", "u2.id", "v.user_id")
            .where("r.id", roomId);
        const masterData = getMasterData(selectMaster);
        return { user: JSON.parse(userData[0].data), master: masterData };
    },
    trackAdd: async (body) => {
        const { roomId, userId } = body;
        let id = 0;
        let name = "";
        const trx = await knex.transaction();
        try {
            const select = await trx("track AS t").select(["t.track_id AS trackId"]).where("t.room_id", roomId).orderBy("t.track_id", "desc").forUpdate();
            if (select.length == 0) {
                id = 1;
            }
            else {
                id = parseInt(select[0].trackId) + 1;
            }
            name = `Track${id}`;
            await trx("track").insert({
                name,
                user_id: userId,
                room_id: roomId,
                track_id: id
            });
            await trx.commit();
            
            return {
                id,
                name,
                instrument: "piano",
                creator: {
                    id: userId,
                    name: "test" + userId
                }
            };
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    trackCommit: async (body) => {
        const { roomId, userId, trackId, name, notes } = body;
        const newNotes = JSON.stringify(notes);
        const trx = await knex.transaction();
        try {
            const select = await trx("version AS v").select(["v.version", "v.track_pid AS trackPid", "v.notes AS notes"])
                .innerJoin("track AS t", "v.track_pid", "t.id").where("t.track_id", trackId)
                .andWhere("t.room_id", roomId).orderBy("v.version", "desc").limit(1).forUpdate();

            let version, trackPid, oldNotes;
            if (select.length > 0) {
                const { version: sVersion, trackPid: sTrackPid, notes: sOldNotes } = select[0];
                version = sVersion;
                trackPid = sTrackPid;
                oldNotes = sOldNotes;
            }
            else {
                const select = await trx("track AS t").select(["t.id AS id"]).where("t.track_id", trackId).andWhere("t.room_id", roomId);
                trackPid = select[0].id;
                version = 0;
                oldNotes = "{}";
            }
            if (newNotes === oldNotes) {
                await trx.rollback();
                return new Error("No Change");
            }

            const newVersion = version + 1;
            const data = {
                track_pid: trackPid,
                version: newVersion,
                user_id: userId,
                name,
                notes: newNotes
            };
            await trx("version").insert(data);
            await trx.commit();
            return {
                id: trackId,
                commiter: {
                    id: userId,
                    name: "test" + userId
                },
                version: {
                    version: newVersion,
                    name: name
                },
                notes
            };
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    versionPull: async (roomId, trackId, version) => {
        const select = await knex("version AS v").select(["v.notes AS notes", "t.track_id AS trackId"]).innerJoin("track AS t", "v.track_pid", "t.id")
            .where("v.version", version).andWhere("t.track_id", trackId).andWhere("t.room_id", roomId);
        return { notes: JSON.parse(select[0].notes), trackId };
    },
    authorityCheck: async (body) => {
        const { roomId, userId, trackId } = body;
        const select = await knex("track AS t").select(["t.user_id AS creatorId"])
            .where("t.track_id", trackId).andWhere("t.room_id", roomId);
        return select[0].creatorId === userId;
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