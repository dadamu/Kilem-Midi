const knex = require("../../util/mysqlCon").knex;
const moment = require("moment");
module.exports = {
    create: async (body) => {
        const { roomId, userId, msg } = body;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        const users = await knex("user")
            .select("username")
            .where("id", userId);
        const name = users[0].username;
        await knex("chat").insert({ user_id: userId, room_id: roomId, date, msg });
        return {
            user: {
                id: userId,
                name
            },
            msg,
            date
        };
    },
    get: async (roomId, paging) => {
        const result = {};
        const chats = await knex("chat AS c")
            .select(["u.id AS userId", "u.username AS username", "c.msg AS msg", "c.date AS date"])
            .innerJoin("user AS u", "u.id", "c.user_id")
            .where("room_id", roomId).limit(51).orderBy("date", "desc");
        if (chats.length > 50) {
            chats.pop();
            result.next = paging + 1;
        }
        const chatmsgs = chats.map(item => {
            return {
                user: {
                    id: item.userId,
                    name: item.username
                },
                msg: item.msg,
                date: moment(item.data).format("YYYY-MM-DD HH:mm:ss")
            };
        });
        result.data = chatmsgs.reverse();
        return result;
    }
};