const roomModel = require("../models/roomModel");
const asyncHandler = require("../../util/asyncHandler");
const jwt = require("jsonwebtoken");
const { JWT_KEY, BCRYPT_SALT } = process.env;
const bcrypt = require("bcrypt");
const trackModel = require("../models/trackModel");
module.exports = {
    get: asyncHandler(async (req, res) => {
        const { type } = req.params;
        let { paging, keyword } = req.query;
        const { headers } = req;
        paging = paging | 0;
        const isAuth = Object.prototype.hasOwnProperty.call(headers, "authorization");
        if (!isAuth) {
            const err = new Error("Forbidden");
            err.status = 403;
            throw err;
        }
        const token = headers["authorization"].split(" ")[1];
        const user = jwt.verify(token, JWT_KEY);
        const requirement = { user, paging, keyword };
        const rooms = await roomModel.get(type, requirement);
        res.json(rooms);
    }),
    create: asyncHandler(async (req, res) => {
        const user = jwt.verify(req.body.token, JWT_KEY);
        const { room } = req.body;
        if (Object.hasOwnProperty.call(room, "password")) {
            const salt = bcrypt.genSaltSync(parseInt(BCRYPT_SALT));
            const bcryptPass = bcrypt.hashSync(room.password, salt);
            room.password = bcryptPass;
        }
        const roomId = await roomModel.create(room, user);
        await trackModel.add({
            roomId, 
            userId: user.id
        });
        res.status(201).json({ roomId });
    }),
    put: asyncHandler(async (req, res) => {
        await roomModel.update(req.body);
        res.json({ status: "success" });
    }),
    delete: asyncHandler(async (req, res) => {
        const user = jwt.verify(req.body.token, JWT_KEY);
        await roomModel.delete(req.body.roomId, user);
        res.status(201).json({ status: "success" });
    }),
    userJoin: asyncHandler(async (req, res) => {
        const { token, roomId } = req.body;
        const user = jwt.verify(token, JWT_KEY);
        const check = await roomModel.checkUser(roomId, user);
        if (check) {
            res.status(201).json({ status: "success" });
            return;
        }
        const roomPassword = await roomModel.getPassword(roomId);
        if (roomPassword) {
            const password = req.body.password || "";
            const passCheck = bcrypt.compareSync(password, roomPassword);
            if (!passCheck) {
                const err = new Error("Wrong password");
                err.status = 403;
                throw err;
            }
        }
        await roomModel.addUser(roomId, user);
        res.status(201).json({ status: "success" });
    }),
    userExit: asyncHandler(async (req, res) => {
        const { token, roomId } = req.body;
        const user = jwt.verify(token, JWT_KEY);
        const tracks = await roomModel.deleteUser(roomId, user);
        const io = req.app.get("io");
        for (let track of tracks) {
            io.of("/room" + roomId).emit("lock", {
                track: {
                    id: track.id,
                    locker: {
                        id: null,
                        name: null
                    }
                }
            });
        }
        res.status(201).json({ status: "success" });
    })
};