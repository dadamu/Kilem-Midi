const knex = require("../../util/mysqlCon").knex;
const moment = require("moment");
module.exports = {
    create: async (info, user) => {
        const { roomId, msg } = info;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        const users = await knex("user")
            .select("username")
            .where("id", user.id);
        const name = users[0].username;
        await knex("chat").insert({ user_id: user.id, room_id: roomId, date, msg });
        return {
            user: {
                id: user.id,
                name
            },
            msg,
            date
        };
    },
    get: async (roomId, paging) => {
        const num = 20;
        const result = {};
        const chats = await knex("chat AS c")
            .select(["u.id AS userId", "u.username AS username",
                "c.msg AS msg", "c.date AS date"])
            .innerJoin("user AS u", "u.id", "c.user_id")
            .where("room_id", roomId).limit(num + 1).offset(num * paging)
            .orderBy("date", "desc");
        if (chats.length > num) {
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