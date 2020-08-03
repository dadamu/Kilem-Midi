const knex = require("../../util/mysqlCon").knex;
module.exports = {
    add: async (body) => {
        const { roomId, userId } = body;
        let id = 0;
        let name = "";
        const trx = await knex.transaction();
        try {
            const trackSelects = await trx("track AS t").select(["t.id AS trackId"])
                .where("t.room_id", roomId).orderBy("t.id", "desc");
            name = `Track${trackSelects.length + 1}`;
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
            const trackSelects = await trx("track AS t").select(["t.user_id AS userId"])
                .where("t.id", trackId).forUpdate();
            if (trackSelects[0].userId === parseInt(userId || trackSelects[0].lock === 0)) {
                await trx("track AS t").update("t.active", 0).where("t.id", trackId);
                await trx.commit();
                return {
                    id: trackId,
                };

            }
            else {
                await trx.rollback();
                return new Error("lock failed");
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
            const versionSelects = await trx("version AS v")
                .select(["v.version", "v.track_id AS track_id", "v.notes AS notes"])
                .where("v.track_id", trackId).orderBy("v.version", "desc").limit(1).forUpdate();

            let version, oldNotes;
            if (versionSelects.length > 0) {
                const { version: versionSelect, notes: notesSelect } = versionSelects[0];
                version = versionSelect;
                oldNotes = notesSelect;
            }
            else {
                version = 0;
                oldNotes = "{}";
            }
            if (newNotes === oldNotes) {
                await trx.rollback();
                return new Error("It's already the latest version");
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
            throw e;
        }
    },
    versionPull: async (trackId, version) => {
        const versionSelects = await knex("version AS v").select(["v.notes AS notes", "v.track_id AS trackId"])
            .where("v.version", version).andWhere("v.track_id", trackId);
        if (versionSelects.length > 0) {
            return { notes: JSON.parse(versionSelects[0].notes), trackId };
        }
        else {
            return {};
        }
    },
    authorityCheck: async (trackId, body) => {
        const { userId } = body;
        const lockerSelects = await knex("track AS t").select(["t.user_id AS id"])
            .where("t.id", trackId);
        return lockerSelects[0].id === userId;
    },
    lockSet: async (trackId, body) => {
        const trx = await knex.transaction();
        const { userId } = body;
        try {
            const lockerSelects = await trx("track AS t").select(["t.user_id AS id"]).where("t.id", trackId).forUpdate();
            if (!lockerSelects[0].id) {
                await trx("track AS t").update("t.user_id", userId).where("t.id", trackId);
                const nameSelects = await trx("user AS u").select(["u.username AS name"]).where("u.id", userId);
                await trx.commit();
                return {
                    id: trackId,
                    locker: {
                        id: userId,
                        name: nameSelects[0].name
                    }
                };
            }
            else if (parseInt(lockerSelects[0].id) === parseInt(userId)) {
                await trx("track AS t").update("t.user_id", null).where("t.id", trackId);
                await trx.commit();
                return {
                    id: trackId,
                    locker: {
                        id: null,
                        name: null
                    }
                };
            }
            await trx.rollback();
            return new Error("lock failed");
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    nameChange: async (trackId, body) => {
        const trx = await knex.transaction();
        const { userId, name } = body;
        try {
            const lockerSelects = await trx("track AS t").select(["id"]).where("t.id", trackId).andWhere("t.user_id", userId);
            if (lockerSelects.length === 0) {
                await trx.rollback();
                return new Error("lock failed");
            }
            await trx("track AS t").update("t.name", name).where("t.id", trackId);
            await trx.commit();
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    instrumentSet: async (trackId, body) => {
        const trx = await knex.transaction();
        const { userId, instrument } = body;
        try {
            const lockerSelects = await trx("track AS t").select(["t.user_id AS id"]).where("t.id", trackId).forUpdate();
            if (parseInt(lockerSelects[0].id) === parseInt(userId)) {
                await trx("track AS t").update("t.instrument", instrument).where("t.id", trackId);
                await trx.commit();
                return {
                    id: trackId,
                    instrument
                };
            }
            else {
                trx.rollback();
                return new Error("lock failed");
            }
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};