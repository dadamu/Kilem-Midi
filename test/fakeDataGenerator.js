require('dotenv').config();
const { NODE_ENV, BCRYPT_SALT } = process.env;
const { knex } = require('../util/mysqlCon');
const { users } = require('./fakeData');
const bcrypt = require('bcrypt');
async function truncateFakeData() {
    if (NODE_ENV !== 'test') {
        console.log('Not in test env');
        return;
    }
    try {
        const trx = await knex.transaction();
        await trx.raw('SET foreign_key_checks = 0;');
        await Promise.all([
            trx.truncate('chat'),
            trx.truncate('room'),
            trx.truncate('save'),
            trx.truncate('track'),
            trx.truncate('version'),
            trx.truncate('user'),
        ]);
        await trx.raw('SET foreign_key_checks = 1;');
        await trx.commit();
    }
    catch (e) {
        console.log(e);
        throw (e);
    }
    console.log('truncate tables success');
}

async function createFakeData() {
    await createFakeUser();
}

async function createFakeUser() {
    const encryped_users = users.map(user => {
        return {
            id: user.id,
            provider: user.provider,
            email: user.email,
            username: user.username,
            password: user.password ? bcrypt.hashSync(user.password, parseInt(BCRYPT_SALT)) : null,
        };
    });
    return knex('user').insert(encryped_users);
}



module.exports = {
    truncateFakeData,
    createFakeData
};