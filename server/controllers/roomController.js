const roomModel = require("../models/roomModel");
const asyncHandler = require("../../util/asyncHandler");
const { BCRYPT_SALT } = process.env;
const bcrypt = require("bcrypt");
const trackModel = require("../models/trackModel");
const appDebug = require("debug")("app");
module.exports = {
    get: asyncHandler(async (req, res) => {
        const { type } = req.params;
        let { paging, keyword } = req.query;
        const { user } = req;
        paging = paging | 0;    
        const requirement = { user, paging, keyword };
        const rooms = await roomModel.get(type, requirement);
        res.json(rooms);
    }),
    create: asyncHandler(async (req, res) => {
        const { user } = req; 
        const { room } = req.body;
        if (Object.hasOwnProperty.call(room, "password")) {
            const salt = bcrypt.genSaltSync(parseInt(BCRYPT_SALT));
            const bcryptPass = bcrypt.hashSync(room.password, salt);
            room.password = bcryptPass;
        }
        const roomId = await roomModel.create(room, user);
        console.log(user);
        await trackModel.add(roomId, user);
        res.status(201).json({ roomId });
    }),
    put: asyncHandler(async (req, res) => {
        await roomModel.update(req.body, req.user);
        appDebug("update success: ", req.body);
        res.json({ status: "success" });
    }),
    delete: asyncHandler(async (req, res) => {
        const { user } = req; 
        await roomModel.delete(req.body.roomId, user);
        res.status(201).json({ status: "success" });
    }),
    userJoin: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const { user } = req; 
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
                err.status = 401;
                throw err;
            }
        }
        await roomModel.addUser(roomId, user);
        res.status(201).json({ status: "success" });
    }),
    userExit: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const { user } = req; 
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