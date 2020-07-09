const midiModel = require("../Models/roomModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    createRoom: asyncHandler(async (req, res) => {
        const roomId = await midiModel.createRoom(req.body);
        res.status(201).json({ roomId });
    }),
    addUser: asyncHandler(async (req, res, next) => {
        try {
            await midiModel.addUser(req.body);
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