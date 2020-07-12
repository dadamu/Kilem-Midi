const knex = require("../../util/mysqlCon").knex;
module.exports = {
    add: async (body) => {
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
                locker: {
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
    delete: async (body) => {
        const { roomId, userId, trackId } = body;
        const trx = await knex.transaction();
        try {
            const select = await trx("track AS t").select(["t.user_id AS userId", "t.lock AS lock"]).where("t.track_id", trackId).andWhere("t.room_id", roomId).forUpdate();
            if (select[0].userId === parseInt(userId || select[0].lock === 0)) {
                await trx("track AS t").update("t.active", 0).where("t.track_id", trackId).andWhere("t.room_id", roomId);
                await trx.commit();
                return {
                    id: trackId,
                };

            }
            else {
                await trx.rollback();
                return new Error("It's Not Your Locked Track");
            }
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    commit: async (body) => {
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
            console.log(e);
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
        const select = await knex("track AS t").select(["t.user_id AS lockerId"])
            .where("t.track_id", trackId).andWhere("t.room_id", roomId);
        return select[0].lockerId === userId;
    }
};