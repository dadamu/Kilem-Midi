const users = require('./users');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const expire = process.env.TOKEN_EXPIRE;
const { JWT_KEY } = process.env;
module.exports = { 
    valid: jwt.sign(payloadGen(users[0], expire), JWT_KEY),
    expired: jwt.sign(payloadGen(users[0], -expire), JWT_KEY)
};

function payloadGen(user, expire) {
    return {
        id: user.id,
        username: user.username,
        exp: Math.floor((Date.now() + expire * 1000) / 1000)
    };
}