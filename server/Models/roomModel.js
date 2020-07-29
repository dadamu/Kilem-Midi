const knex = require("../../util/mysqlCon").knex;
module.exports = {
    get: async (type, requirement) => {
        const num = 3;
        let query = knex("room AS r")
            .select(["r.id AS id", "r.name As name", "r.filename AS filename", "u.username AS username", "r.intro AS intro"])
            .innerJoin("user AS u", "r.user_id", "u.id");
        const result = {};
        let maxPaging;
        const { paging } = requirement;
        if (type === "public") {
            query = query.clone().where("r.is_private", 0);
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const data = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.data = data;
        }
        else if (type === "my") {
            const { user } = requirement;
            const { id: userId } = user;
            query = query.clone().where("user_id", userId);
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const data = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.data = data;
        }
        else if (type === "in") {
            const { user } = requirement;
            const { id: userId } = user;
            query = query.clone().innerJoin("save AS s", "s.room_id", "r.id").where("s.user_id", userId).andWhereNot("r.user_id", userId);
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const data = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.data = data;
        }
        else if (type === "search"){
            let { keyword } = requirement;
            keyword = `%${keyword}%`;
            query = query.clone().where("r.is_private", 0).andWhere(function(){
                this.where("r.name", "like", keyword).orWhere("r.filename", "like", keyword);
            });
            const count = await query.clone().count("* AS total");
            maxPaging = Math.ceil(count[0].total / num);
            const data = await query.clone().offset(paging * num).limit(num).orderBy("r.id", "desc");
            result.data = data;
        }
        else {
            const roomId = type;
            const { user } = requirement;
            const data = await knex("room AS r")
                .select(["r.id AS id", "r.name As name", "r.filename AS filename", "u.username AS username", "r.intro AS intro", "r.password AS password"])
                .innerJoin("user AS u", "r.user_id", "u.id").where("r.id", roomId);
            if (data.length === 0) {
                return new Error("Room not exist");
            }
            const select = await knex("save").select(["user_id"]).where("room_id", roomId).andWhere("user_id", user.id);
            if(select.length === 1){
                data[0].password = null;
            }
            if (data[0].password) {
                data[0].password = true;
            }
            result.data = data;
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
    create: async (body, user) => {
        const { room } = body;
        room.is_private = room.isPrivate;
        delete room.isPrivate;
        room.user_id = user.id;
        const roomId = await knex("room").insert(room);
        await knex("save").insert({ user_id: user.id, room_id: roomId[0] });
        return roomId[0];
    },
    delete: async (body, user) => {
        const { roomId } = body;
        const result = await knex("room").where("id", roomId).andWhere("user_id", user.id).del();
        if (result === 0) {
            return new Error("You are Not this room's creator");
        }
        return;
    },
    update: async(body) => {
        const id = body.id;
        const newContent = body;
        delete newContent.id;
        const result = await knex("room").update(newContent).where("id", id);
        if(result.length === 0){
            return new Error("Failed to Update");
        }
        return;
    },
    hasRoom: async (id) => {
        const room = await knex("room").where({ id });
        return room.length > 0;
    },
    checkUser: async (roomId, user) => {
        const select = await knex("save").select(["user_id"]).where("room_id", roomId).andWhere("user_id", user.id);
        return select.length === 1;
    },
    getPassword: async (roomId) => {
        const select = await knex("room").select(["password"]).where("id", roomId);
        return select[0].password;
    },
    addUser: async (roomId, user) => {
        await knex("save").insert({ user_id: user.id, room_id: roomId });
        return;
    },
    deleteUser: async (roomId, user) => {
        await knex("save").where("room_id", roomId).andWhere("user_id", user.id).del();
        const select = await knex("track").select("id").where("room_id", roomId).andWhere("user_id", user.id);
        await knex("track").update("user_id", null).where("room_id", roomId).andWhere("user_id", user.id);
        return select;
    }
};