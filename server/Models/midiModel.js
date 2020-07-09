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
        return { userData: userData[0].data };
    },
    addTrack: async (body) => {
        return body;
    }
};