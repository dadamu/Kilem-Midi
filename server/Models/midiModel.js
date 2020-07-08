const knex = require("../../util/mysqlCon").knex;
module.exports = {
    createRoom: async (body) => {
        const { roomName, userId } = body;
        const roomId = await knex("room").insert({ name: roomName, user_id: userId }).returning("id");
        return roomId[0];
    },
    hasRoom: async (id) => {
        const room = await knex("room").where({ id });
        return room.length > 0;
    },
    saveFile: async (body) => {
        const { roomId, userId, data } = body;
        await knex("save").update({
            data: JSON.stringify(data)
        }).where("room_id", roomId).andWhere("user_id", userId);
        return;
    },
    addUser: async (body) => {
        const { roomId, userId } = body;
        await knex("save").insert({ user_id: userId, room_id: roomId });
        return;
    },
    getFile: async (roomId, userId) => {
        const userData = await knex("save").select(["data"]).where("room_id", roomId).andWhere("user_id", userId);
        return { userData: userData[0].data };
    },
    addTrack: async (body) => {
        return body;
    }
};