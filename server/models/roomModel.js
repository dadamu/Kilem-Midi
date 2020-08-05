const knex = require("../../util/mysqlCon").knex;
module.exports = {
    get: async (type, requirement) => {
        const num = 3;
        let query = knex("room AS r")
            .select(["r.id AS id", "r.name As name", "r.filename AS filename",
                "u.username AS username", "r.intro AS intro"])
            .innerJoin("user AS u", "r.user_id", "u.id");
        const result = {};
        let maxPaging;
        const { paging } = requirement;
        if (type === "public") {
            query = query.clone().where("r.is_private", 0);
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const rooms = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.rooms = rooms;
        }
        else if (type === "my") {
            const { user } = requirement;
            query = query.clone().where("user_id", user.id);
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const rooms = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.rooms = rooms;
        }
        else if (type === "in") {
            const { user } = requirement;
            query = query.clone().innerJoin("save AS s", "s.room_id", "r.id")
                .where("s.user_id", user.id).andWhereNot("r.user_id", user.id);
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const rooms = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.rooms = rooms;
        }
        else if (type === "search") {
            let { keyword } = requirement;
            keyword = `%${keyword}%`;
            query = query.clone().where("r.is_private", 0).andWhere(function () {
                this.where("r.name", "like", keyword).orWhere("r.filename", "like", keyword);
            });
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const rooms = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.rooms = rooms;
        }
        else {
            const roomId = type;
            const { user } = requirement;
            const rooms = await knex("room AS r")
                .select(["r.id AS id", "r.name As name", "r.filename AS filename",
                    "u.username AS username", "r.intro AS intro", "r.password AS password"])
                .innerJoin("user AS u", "r.user_id", "u.id").where("r.id", roomId);
            if (rooms.length === 0) {
                const err = new Error("Room does not exist");
                err.status = 404;
                throw err;
            }
            const users = await knex("save")
                .select(["user_id"])
                .where("room_id", roomId)
                .andWhere("user_id", user.id);
            if (users.length === 1) {
                rooms[0].password = null;
            }
            if (rooms[0].password) {
                rooms[0].password = true;
            }
            result.rooms = rooms;
            return result;
        }

        if (paging > 0) {
            result.previous = paging - 1;
        }
        if (paging < maxPaging - 1) {
            result.next = paging + 1;
        }
        return result;
    },
    create: async (room, user) => {
        room.is_private = room.isPrivate;
        delete room.isPrivate;
        room.user_id = user.id;
        const roomId = await knex("room").insert(room);
        await knex("save").insert({ user_id: user.id, room_id: roomId[0] });
        return roomId[0];
    },
    delete: async (roomId, user) => {
        const deletedNum = await knex("room").where("id", roomId).andWhere("user_id", user.id).del();
        if (deletedNum === 0) {
            const err = new Error("Failed");
            err.status = 403;
            throw err;
        }
    },
    update: async (info, user) => {
        const updatedNum = await knex("room").update(info).where("id", info.id).where("user_id", user.id);
        if (updatedNum === 0) {
            const err = new Error("Failed");
            err.status = 400;
            throw err;
        }
    },
    hasRoom: async (roomId) => {
        const room = await knex("room").where({ id: roomId });
        return room.length > 0;
    },
    checkUser: async (roomId, user) => {
        const users = await knex("save")
            .select(["user_id"])
            .where("room_id", roomId)
            .andWhere("user_id", user.id);
        return users.length === 1;
    },
    getPassword: async (roomId) => {
        const rooms = await knex("room")
            .select(["password"])
            .where("id", roomId);
        return rooms[0].password;
    },
    addUser: async (roomId, user) => {
        await knex("save").insert({ user_id: user.id, room_id: roomId });
        return;
    },
    deleteUser: async (roomId, user) => {
        await knex("save").where("room_id", roomId).andWhere("user_id", user.id).del();
        const tracks = await knex("track")
            .select("id")
            .where("room_id", roomId)
            .andWhere("user_id", user.id);
        await knex("track")
            .update("user_id", null)
            .where("room_id", roomId)
            .andWhere("user_id", user.id);
        return tracks;
    }
};