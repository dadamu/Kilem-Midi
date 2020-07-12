const knex = require("../../util/mysqlCon").knex;
const moment = require("moment");
module.exports = {
    create: async (body) => {
        const { roomId, userId, msg } = body;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        const select = await knex("user").select("username").where("id", userId);
        const name = select[0].username;
        await knex("chat").insert({ user_id: userId, room_id: roomId, date, msg });
        return {
            user: name,
            msg,
            date
        };
    },
    get: async (roomId, paging) => {
        const result = {};
        const select = await knex("chat").where("room_id", roomId).limit(51).orderBy("date", "desc");
        if(select.length > 30 ){
            select.pop();
            result.next = paging+1;
        }
        console.log(select);
        return result;
    }
};