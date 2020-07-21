const knex = require("../../util/mysqlCon").knex;

module.exports = {
    signup: async (data) => {
        try{
            const insert = await knex("user").insert(data);
            const result = {
                id: insert[0],
                username: data.username
            };
            return result;
        }
        catch(e){
            if(e.errno === 1062){
                return new Error("email has exist");
            }
            throw e;
        }
    },
    get: async(email) => {
        const select = await knex("user").select(["id", "username", "password"]).where("email", email);
        return select;
    }
};