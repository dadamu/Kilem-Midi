const roomModel = require("../models/roomModel");
const asyncHandler = require("../../util/asyncHandler");
const jwt = require("jsonwebtoken");
const { JWT_KEY } = process.env;
module.exports = {
    get: asyncHandler(async (req, res) => {
        const { type } = req.params;
        const { headers } = req;
        const isAuth = Object.prototype.hasOwnProperty.call(headers, "authorization");
        if (isAuth) {
            const token = headers["authorization"].split(" ")[1];
            try {
                const user = jwt.verify(token, JWT_KEY);
                const data = await roomModel.get(type, user);
                res.json({ data });
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
        const roomId = await roomModel.create(req.body);
        res.status(201).json({ roomId });
    }),
    addUser: asyncHandler(async (req, res, next) => {
        try {
            const { token, roomId } = req.body;
            const user = jwt.verify(token, JWT_KEY);
            await roomModel.addUser(roomId, user);
            res.status(201).json({ status: "success" });
        }
        catch (e) {
            if (e.errno === 1062) {
                res.status(200).json({ status: "User has existed in room" });
                return;
            }
            next(e);
        }
    })
};