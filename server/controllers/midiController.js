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
                const track = await midiModel.trackAdd(req.body);
                res.json({ track });
                break;
            }
            case "commitTrack": {
                const isValid = await midiModel.commitAuthorityCheck(req.body);
                if(!isValid){
                    res.json({ error: "It's Not Your Locked Track" });
                    break;
                }
                const result = await midiModel.trackCommit(req.body);
                if (result instanceof Error) {
                    res.json({ error: result.message });
                    break;
                }
                res.json({ status: "success" });
                break;
            }
        }
    }),
    pull: asyncHandler(async (req, res) => {
        const { roomId, trackId, version } = req.query;
        const result = await midiModel.versionPull(roomId, trackId, version);
        res.json(result);
    })
};