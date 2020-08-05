const knex = require('../../util/mysqlCon').knex;

module.exports = {
    signup: async (userInfo) => {
        try{
            const insert = await knex('user').insert(userInfo);
            const user = {
                id: insert[0],
                username: userInfo.username
            };
            return user;
        }
        catch(e){
            if(e.errno === 1062){
                const err = new Error('Email has already existed');
                err.status = 400;
                throw err;
            }
            throw e;
        }
    },
    get: async(email) => {
        const users = await knex('user')
            .select(['id', 'username', 'password'])
            .where('email', email);
        return users;
    }
};