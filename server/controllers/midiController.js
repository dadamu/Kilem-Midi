const midiModel = require("../Models/midiModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    save: asyncHandler(async (req, res) => {
        await midiModel.saveFile(req.body);
        res.status(201).json({ status: "success" });
    }),
    getFile: asyncHandler(async (req, res) => {
        const { roomId, userId } = req.query;
        if (!roomId || !userId) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const file = await midiModel.getFile(roomId, userId);
        res.status(200).json({ data: file });
    }),
    commit: asyncHandler(async (req, res) => {
        const { type } = req.body;
        switch (type) {
            case "addTrack": {
                const trackId = await midiModel.addTrack(req.body);
                res.json({ trackId });
                break;
            }
        }
    })
};