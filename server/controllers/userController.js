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
    profileGet: (async (req, res) => {
        profileGet(req, res);
    })
};

async function nativeSignUp(req, res) {
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

async function googleSignUp(req, res) {
    let { accessToken } = req.body;
    const data = await getGoogleProfie(accessToken);
    if(data instanceof Error){
        res.status(400).json({error: data.message});
        return;
    }
    const result = await userModel.signup(data);
    const token = jwt.sign(payloadGen(result), JWT_KEY);
    res.json({
        accessToken: token,
        user: result
    });
}

async function googleSignIn(req, res) {
    let { accessToken } = req.body;
    const data = await getGoogleProfie(accessToken);
    if(data instanceof Error){
        res.status(400).json({error: data.message});
        return;
    }
    const select = await userModel.get(data.email);
    if (select.length === 0) {
        res.status(400).json({ error: "User not Exist" });
        return;
    }
    const user = select[0];
    const token = jwt.sign(payloadGen(user), JWT_KEY);
    res.json({
        accessToken: token,
        user
    });
}

async function getGoogleProfie(accessToken){
    try{
        const googleUser = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`).then(res => res.json());
        return {
            email: googleUser.email,
            username: googleUser.name,
            provider: "google"
        };
    }
    catch(e){
        return new Error("Google Invalid Token");
    }
}

async function nativeSignIn(req, res) {
    let { email, password } = req.body;
    const isEmail = validator.isEmail(email);
    const passValid = !validator.isEmpty(password);
    if (!isEmail || !passValid) {
        res.status(400).json({ error: "Invalid Input" });
        return;
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