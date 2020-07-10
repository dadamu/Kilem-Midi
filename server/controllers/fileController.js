const fileModel = require("../Models/fileModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    save: asyncHandler(async (req, res) => {
        await fileModel.saveFile(req.body);
        res.status(201).json({ status: "success" });
    }),
    getFile: asyncHandler(async (req, res) => {
        const { roomId, userId } = req.query;
        if (!roomId || !userId) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const file = await fileModel.getFile(roomId, userId);
        res.status(200).json({ data: file });
    }),
};