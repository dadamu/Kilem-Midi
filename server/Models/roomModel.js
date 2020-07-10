const knex = require("../../util/mysqlCon").knex;
module.exports = {
    create: async (body) => {
        const { roomName, userId } = body;
        const roomId = await knex("room").insert({ name: roomName, user_id: userId }).returning("id");
        return roomId[0];
    },
    hasRoom: async (id) => {
        const room = await knex("room").where({ id });
        return room.length > 0;
    },
    addUser: async (body) => {
        const { roomId, userId } = body;
        await knex("save").insert({ user_id: userId, room_id: roomId });
        return;
    }
};