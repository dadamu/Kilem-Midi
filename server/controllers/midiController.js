const midiModel = require("../Models/midiModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    save: asyncHandler(async (req, res) => {
        await midiModel.saveFile(req.body);
        res.status(201).json({ status: "success" });
    }),
    getFile: asyncHandler(async (req, res) => {
        const { room, user } = req.query;
        if (!room || !user) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const file = await midiModel.getFile(room, user);
        res.status(200).json({ data: file });
    }),
    commit: asyncHandler(async (req, res) => {
        const { type } = req.params;
        let result;
        switch (type) {
            case "addTrack":
                await midiModel.addTrack(req.body);
                break;
        }
        res.send(result);
    })
};