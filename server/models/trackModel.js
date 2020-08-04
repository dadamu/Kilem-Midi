const knex = require("../../util/mysqlCon").knex;
module.exports = {
    add: async (track) => {
        const { roomId, userId } = track;
        let id = 0;
        let name = "";
        const trx = await knex.transaction();
        try {
            const tracks = await trx("track AS t").select(["t.id AS trackId"])
                .where("t.room_id", roomId).orderBy("t.id", "desc");
            name = `Track${tracks.length + 1}`;
            const trackIds = await trx("track").insert({
                name,
                user_id: userId,
                room_id: roomId,
            });
            id = trackIds[0];
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
    delete: async (trackId, info) => {
        const { userId } = info;
        const trx = await knex.transaction();
        try {
            const tracks = await trx("track AS t").select(["t.user_id AS userId"])
                .where("t.id", trackId).forUpdate();
            if (tracks[0].userId === parseInt(userId || tracks[0].lock === 0)) {
                await trx("track AS t").update("t.active", 0).where("t.id", trackId);
                await trx.commit();
                return {
                    id: trackId,
                };

            }
            else {
                await trx.rollback();
                const err = new Error("lock failed");
                err.status = 401;
                throw err;
            }
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    commit: async (trackId, track) => {
        const { userId, name, notes } = track;
        const newNotes = JSON.stringify(notes);
        const trx = await knex.transaction();
        try {
            const versions = await trx("version AS v")
                .select(["v.version", "v.track_id AS track_id", "v.notes AS notes"])
                .where("v.track_id", trackId)
                .orderBy("v.version", "desc")
                .limit(1)
                .forUpdate();

            let version, oldNotes;
            if (versions.length > 0) {
                oldNotes = versions[0].notes;
                version = versions[0].version;
            }
            else {
                version = 0;
                oldNotes = "{}";
            }
            if (newNotes === oldNotes) {
                await trx.rollback();
                const err = new Error("It's already the latest version");
                err.status = 400;
                throw err;
            }

            const newVersion = version + 1;
            const insertData = {
                track_id: trackId,
                version: newVersion,
                user_id: userId,
                name,
                notes: newNotes
            };
            await trx("version").insert(insertData);
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
        const versions = await knex("version AS v")
            .select(["v.notes AS notes", "v.track_id AS trackId"])
            .where("v.version", version)
            .andWhere("v.track_id", trackId);
        if (versions.length > 0) {
            return { notes: JSON.parse(versions[0].notes), trackId };
        }
        else {
            return {};
        }
    },
    authorityCheck: async (trackId, user) => {
        const { userId } = user;
        const lockers = await knex("track AS t")
            .select(["t.user_id AS id"])
            .where("t.id", trackId);
        return lockers[0].id === userId;
    },
    lockSet: async (trackId, userId) => {
        const trx = await knex.transaction();
        try {
            const lockers = await trx("track AS t")
                .select(["t.user_id AS id"])
                .where("t.id", trackId)
                .forUpdate();

            const isLocker = parseInt(lockers[0].id) === parseInt(userId);
            const isLock = lockers[0].id;
            if (!isLock) {
                await trx("track AS t")
                    .update("t.user_id", userId)
                    .where("t.id", trackId);
                const nameSelects = await trx("user AS u")
                    .select(["u.username AS name"])
                    .where("u.id", userId);
                await trx.commit();
                return {
                    id: trackId,
                    locker: {
                        id: userId,
                        name: nameSelects[0].name
                    }
                };
            }
            else if (isLocker) {
                await trx("track AS t")
                    .update("t.user_id", null)
                    .where("t.id", trackId);
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
            const err = new Error("lock failed");
            err.status = 401;
            throw err;
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    nameChange: async (trackId, changeInfo) => {
        const trx = await knex.transaction();
        const { userId, name } = changeInfo;
        try {
            const lockers = await trx("track AS t")
                .select(["id"])
                .where("t.id", trackId)
                .andWhere("t.user_id", userId);
            if (lockers.length === 0) {
                await trx.rollback();
                const err = new Error("lock failed");
                err.status = 401;
                throw err;
            }
            await trx("track AS t")
                .update("t.name", name)
                .where("t.id", trackId);
            await trx.commit();
            return;
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    },
    instrumentSet: async (trackId, changeInfo) => {
        const trx = await knex.transaction();
        const { userId, instrument } = changeInfo;
        try {
            const lockers = await trx("track AS t")
                .select(["t.user_id AS id"])
                .where("t.id", trackId)
                .forUpdate();
            const isLocker = parseInt(lockers[0].id) === parseInt(userId);
            if (!isLocker) {
                trx.rollback();
                const err = new Error("lock failed");
                err.status = 401;
                throw err;
            }
            await trx("track AS t").update("t.instrument", instrument).where("t.id", trackId);
            await trx.commit();
            return {
                id: trackId,
                instrument
            };
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};