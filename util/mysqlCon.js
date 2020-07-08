require("dotenv").config();
const { DB_HOST, DB_USER, DB_PASS, DB_DATABASE } = process.env;
module.exports = {
    knex: require("knex")({
        client: "mysql",
        connection: {
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASS,
            database: DB_DATABASE
        },
        pool: {
            min: 0,
            max: 10
        },
        acquireConnectionTimeout: 10000
    })
};