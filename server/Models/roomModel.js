const knex = require("../../util/mysqlCon").knex;
module.exports = {
    get: async (type) => {
        console.log(type);
        let sql = knex("room AS r")
            .select(["r.id AS id", "r.name As name", "r.file_name AS fileName", "u.username AS username"])
            .innerJoin("user AS u", "r.user_id", "u.id");
        const data = await sql;
        return data;
    },
    create: async (body) => {
        const { roomName, userId } = body;
        const roomId = await knex("room").insert({ name: roomName, user_id: userId });
        await knex("save").insert({ user_id: userId, room_id: roomId[0] });
        return roomId[0];
    },
    hasRoom: async (id) => {
        const room = await knex("room").where({ id });
        return room.length > 0;
    },
    addUser: async (roomId, user) => {
        await knex("save").insert({ user_id: user.id, room_id: roomId });
        return;
    }
};