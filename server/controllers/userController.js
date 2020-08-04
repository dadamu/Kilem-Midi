const asyncHandler = require("../../util/asyncHandler");
const userModel = require("../models/userModel");
require("dotenv").config();
const { BCRYPT_SALT, JWT_KEY } = process.env;
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const expire = process.env.TOKEN_EXPIRE; // 30 days by seconds

module.exports = {
    signup: asyncHandler(async (req, res) => {
        const { provider } = req.body;
        if (provider === "native") {
            await nativeSignUp(req, res);
        }
        else if (provider === "google") {
            await googleSignUp(req, res);
        }
    }),
    signin: asyncHandler(async (req, res) => {
        const { provider } = req.body;
        if (provider === "native") {
            await nativeSignIn(req, res);
        }
        else if(provider === "google"){
            await googleSignIn(req, res);
        }
    }),
    profileGet: asyncHandler(async (req, res) => {
        profileGet(req, res);
    })
};

async function nativeSignUp(req, res) {
    let { email, username, password, provider } = req.body;
    const isEmail = validator.isEmail(email);
    const userValid = !validator.isEmpty(username);
    const passValid = !validator.isEmpty(password);
    if (!isEmail || !userValid || !passValid) {
        const err = new Error("Invalid input");
        err.status = 400;
        throw err;
    }
    const salt = bcrypt.genSaltSync(parseInt(BCRYPT_SALT));
    const bcryptPassword = bcrypt.hashSync(password, salt);
    username = validator.escape(username);
    const userInfo = { email, username, password: bcryptPassword, provider };
    const user = await userModel.signup(userInfo);
    const accessToken = jwt.sign(payloadGen(user), JWT_KEY);
    res.json({
        accessToken,
        user
    });
}

async function googleSignUp(req, res) {
    let { accessToken } = req.body;
    const userFromGoogle = await getGoogleProfie(accessToken);
    const user = await userModel.signup(userFromGoogle);
    const token = jwt.sign(payloadGen(user), JWT_KEY);
    res.json({
        accessToken: token,
        user
    });
}

async function googleSignIn(req, res) {
    let { accessToken } = req.body;
    const userFromGoogle = await getGoogleProfie(accessToken);
    const users = await userModel.get(userFromGoogle.email);
    if (users.length === 0) {
        const err = new Error("User not Exist");
        err.status = 400;
        throw err;
    }
    const user = users[0];
    const token = jwt.sign(payloadGen(user), JWT_KEY);
    res.json({
        accessToken: token,
        user
    });
}

async function getGoogleProfie(accessToken){
    try{
        const user = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`).then(res => res.json());
        return {
            email: user.email,
            username: user.name,
            provider: "google"
        };
    }
    catch(e){
        const err = new Error("Google invalid token");
        err.status = 403;
        throw err;
    }
}

async function nativeSignIn(req, res) {
    let { email, password } = req.body;
    const isEmail = validator.isEmail(email);
    const passwordValid = !validator.isEmpty(password);
    const isValid = !isEmail || !passwordValid;
    if (isValid) {
        const err = new Error("Invalid input");
        err.status = 400;
        throw err;
    }
    const users = await userModel.get(email);
    if (users.length === 0) {
        const err = new Error("Wrong Email or Password");
        err.status = 400;
        throw err;
    }
    const user = users[0];
    const passwordCheck = bcrypt.compareSync(password, user.password);
    if (!passwordCheck) {
        res.status(400).json({ error: "Wrong Email or Password" });
        return;
    }
    const accessToken = jwt.sign(payloadGen(user), JWT_KEY);
    res.json({
        accessToken,
        user
    });
}

function profileGet(req, res) {
    const { headers } = req;
    const isAuth = Object.prototype.hasOwnProperty.call(headers, "authorization");
    if (!isAuth) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
    }
    const token = headers["authorization"].split(" ")[1];
    const user = jwt.verify(token, JWT_KEY);
    res.json(user);
}


function payloadGen(user) {
    return {
        id: user.id,
        username: user.username,
        exp: Math.floor((Date.now() + expire * 1000) / 1000)
    };
}