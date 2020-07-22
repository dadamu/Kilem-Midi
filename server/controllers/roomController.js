const roomModel = require("../models/roomModel");
const asyncHandler = require("../../util/asyncHandler");
const jwt = require("jsonwebtoken");
const { JWT_KEY, BCRYPT_SALT } = process.env;
const bcrypt = require("bcrypt");
module.exports = {
    get: asyncHandler(async (req, res) => {
        const { type } = req.params;
        let { paging } = req.query;
        const { headers } = req;
        paging = paging | 0;
        const isAuth = Object.prototype.hasOwnProperty.call(headers, "authorization");
        if (isAuth) {
            const token = headers["authorization"].split(" ")[1];
            try {
                const user = jwt.verify(token, JWT_KEY);
                const requirement = { user, paging };
                const result = await roomModel.get(type, requirement);
                if (result instanceof Error) {
                    res.status(404).json({ error: result.message });
                    return;
                }
                res.json(result);
            }
            catch (e) {
                res.status(403).json({ error: "Invalid Access" });
            }
        }
        else {
            res.status(403).json({ error: "Forbidden" });
        }
    }),
    create: asyncHandler(async (req, res) => {
        const user = jwt.verify(req.body.token, JWT_KEY);
        if (Object.hasOwnProperty.call(req.body.room, "password")) {
            const salt = bcrypt.genSaltSync(parseInt(BCRYPT_SALT));
            const bcryptPass = bcrypt.hashSync(req.body.room.password, salt);
            req.body.room.password = bcryptPass;
        }
        const roomId = await roomModel.create(req.body, user);
        res.status(201).json({ roomId });
    }),
    put: asyncHandler(async (req, res) => {
        const result = await roomModel.update(req.body);
        if(result instanceof Error){
            res.json({ error: result.message });
            return;
        }
        res.json({ status: "success" });
    }),
    delete: asyncHandler(async (req, res) => {
        const user = jwt.verify(req.body.token, JWT_KEY);
        const result = await roomModel.delete(req.body, user);
        if (result instanceof Error) {
            res.status(403).json({ error: result.message });
            return;
        }
        res.status(201).json({ status: "success" });
    }),
    addUser: asyncHandler(async (req, res, next) => {
        try {
            const { token, roomId } = req.body;
            const user = jwt.verify(token, JWT_KEY);
            const check = await roomModel.checkUser(roomId, user);
            if (check) {
                res.status(201).json({ status: "success" });
                return;
            }
            const roomPass = await roomModel.getPassword(roomId);
            if (roomPass) {
                const password = req.body.password || "";
                const passCheck = bcrypt.compareSync(password, roomPass);
                if (!passCheck) {
                    res.status(403).json({ error: "Wrong password" });
                    return;
                }
            }
            await roomModel.addUser(roomId, user);
            res.status(201).json({ status: "success" });
        }
        catch (e) {
            next(e);
        }
    }),
    deleteUser: asyncHandler(async (req, res, next) => {
        try {
            const { token, roomId } = req.body;
            const user = jwt.verify(token, JWT_KEY);
            await roomModel.deleteUser(roomId, user);
            res.status(201).json({ status: "success" });
        }
        catch (e) {
            next(e);
        }
    })
};