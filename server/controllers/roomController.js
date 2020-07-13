const roomModel = require("../models/roomModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    create: asyncHandler(async (req, res) => {
        const roomId = await roomModel.create(req.body);
        res.status(201).json({ roomId });
    }),
    addUser: asyncHandler(async (req, res, next) => {
        try {
            await roomModel.addUser(req.body);
            res.status(201).json({ status: "success" });
        }
        catch (e) {
            if (e.errno === 1062) {
                res.status(400).json({ error: "User has existed in room" });
                return;
            }
            next(e);
        }
    })
};