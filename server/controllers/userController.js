const asyncHandler = require("../../util/asyncHandler");
const userModel = require("../models/userModel");
require("dotenv").config();
const { BCRYPT_SALT, JWT_KEY } = process.env;
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expire = process.env.TOKEN_EXPIRE; // 30 days by seconds

module.exports = {
    signup: asyncHandler(async (req, res) => {
        const { provider } = req.body;
        if (provider === "native") {
            await nativSignUp(req, res);
        }
    }),
    signin: asyncHandler(async (req, res) => {
        const { provider } = req.body;
        if (provider === "native") {
            await nativSignIn(req, res);
        }
    }),
    profileGet: (async (req, res) => {
        profileGet(req, res);
    })
};

async function nativSignUp(req, res) {
    let { email, username, password, provider } = req.body;
    const isEmail = validator.isEmail(email);
    const userValid = !validator.isEmpty(username);
    const passValid = !validator.isEmpty(password);
    if (!isEmail || !userValid || !passValid) {
        res.status(400).json({ error: "Invalid Input" });
        return;
    }
    const salt = bcrypt.genSaltSync(parseInt(BCRYPT_SALT));
    const bcryptPass = bcrypt.hashSync(password, salt);
    username = validator.escape(username);
    const data = { email, username, password: bcryptPass, provider };
    const result = await userModel.signup(data);

    if (result instanceof Error) {
        res.status(400).json({ error: result.message });
        return;
    }
    const accessToken = jwt.sign(payloadGen(result), JWT_KEY);
    res.json({
        accessToken,
        user: result
    });
}


async function nativSignIn(req, res) {
    let { email, password } = req.body;
    const isEmail = validator.isEmail(email);
    const passValid = !validator.isEmpty(password);
    if (!isEmail || !passValid) {
        res.status(400).json({ error: "Invalid Input" });
    }
    const select = await userModel.get(email);
    if (select.length === 0) {
        res.status(400).json({ error: "Wrong Email or Password" });
        return;
    }
    const user = select[0];
    const passCheck = bcrypt.compareSync(password, user.password);
    if (!passCheck) {
        res.status(400).json({ error: "Wrong Email or Password" });
        return;
    }
    const accessToken = jwt.sign(payloadGen(user), JWT_KEY);
    res.json({
        accessToken,
        user
    });
}

async function profileGet(req, res) {
    const { headers } = req;
    const isAuth = Object.prototype.hasOwnProperty.call(headers, "authorization");
    if (!isAuth) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    const token = headers["authorization"].split(" ")[1];
    const data = jwt.verify(token, JWT_KEY);
    res.json(data);


}


function payloadGen(user) {
    return {
        id: user.id,
        username: user.username,
        exp: Math.floor((Date.now() + expire * 1000) / 1000)
    };
}