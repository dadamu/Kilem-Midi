require('dotenv').config();
const { DB_HOST, DB_USER, DB_PASS, DB_DATABASE, DB_DATABASE_TEST } = process.env;
const env = process.env.NODE_ENV || 'prod';
console.log('use ' + env + ' database');
const config = {
    prod: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_DATABASE
    },
    dev: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_DATABASE
    },
    test: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_DATABASE_TEST
    },
};

module.exports = {
    knex: require('knex')({
        client: 'mysql',
        connection: config[env],
        pool: {
            min: 0,
            max: 1000
        },
        acquireConnectionTimeout: 10000
    })
};