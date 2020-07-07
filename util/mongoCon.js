const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const { MONGO_HOST, MONGO_USER, MONGO_PASS, MONGO_PORT, MONGO_DATABASE } = process.env;

module.exports = {
    connect: async () => {
        const connection = new MongoClient(`mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}`, {
            useNewUrlParser   : true,
            useUnifiedTopology: true
        });
        const client = await connection.connect();
        const db = client.db(MONGO_DATABASE);
        return db;
    }
};