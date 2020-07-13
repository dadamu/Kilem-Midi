const knex = require("../../util/mysqlCon").knex;
module.exports = {
    add: async (body) => {
        const { roomId, userId } = body;
        let id = 0;
        let name = "";
        const trx = await knex.transaction();
        try {
            const select = await trx("track AS t").select(["t.id AS trackId"]).where("t.room_id", roomId).orderBy("t.id", "desc").forUpdate();
            name = `Track${select.length + 1}`;
            const ids = await trx("track").insert({
                name,
                user_id: userId,
                room_id: roomId,
            });
            id = ids[0];
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
    delete: async (trackId, body) => {
        const { userId } = body;
        const trx = await knex.transaction();
        try {
            const select = await trx("track AS t").select(["t.user_id AS userId"]).where("t.id", trackId).forUpdate();
            if (select[0].userId === parseInt(userId || select[0].lock === 0)) {
                await trx("track AS t").update("t.active", 0).where("t.id", trackId);
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
    commit: async (trackId, body) => {
        const { userId, name, notes } = body;
        const newNotes = JSON.stringify(notes);
        const trx = await knex.transaction();
        try {
            const select = await trx("version AS v")
                .select(["v.version", "v.track_id AS track_id", "v.notes AS notes"])
                .where("v.track_id", trackId).orderBy("v.version", "desc").limit(1).forUpdate();

            let version, oldNotes;
            if (select.length > 0) {
                const { version: sVersion, notes: sOldNotes } = select[0];
                version = sVersion;
                oldNotes = sOldNotes;
            }
            else {
                version = 0;
                oldNotes = "{}";
            }
            if (newNotes === oldNotes) {
                await trx.rollback();
                return new Error("No Change");
            }

            const newVersion = version + 1;
            const data = {
                track_id: trackId,
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
    versionPull: async (trackId, version) => {
        const select = await knex("version AS v").select(["v.notes AS notes", "v.track_id AS trackId"])
            .where("v.version", version).andWhere("v.track_id", trackId);
        return { notes: JSON.parse(select[0].notes), trackId };
    },
    authorityCheck: async (trackId, body) => {
        const { userId } = body;
        const select = await knex("track AS t").select(["t.user_id AS lockerId"])
            .where("t.id", trackId);
        return select[0].lockerId === userId;
    },
    lockSet: async (trackId, body) => {
        const trx = await knex.transaction();
        const { userId } = body;
        try {
            const select = await knex("track AS t").select(["t.user_id AS lockerId"]).where("t.id", trackId).forUpdate();
            if(!select[0].lockerId){
                await knex("track AS t").update("t.user_id", userId).where("t.id", trackId);
                const nameSelect = await knex("user AS u").select(["u.username AS name"]).where("u.id", userId).forUpdate();
                await trx.commit();
                return {
                    id: trackId,
                    locker: {
                        id: userId,
                        name: nameSelect[0].name
                    }
                };
            }
            else if (parseInt(select[0].lockerId) === parseInt(userId)) {
                await knex("track AS t").update("t.user_id", null).where("t.id", trackId);
                await trx.commit();
                return {
                    id: trackId,
                    locker: {
                        id: null,
                        name: null
                    }
                };
            }
            else{
                return new Error("It's not your locked track");
            }
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};