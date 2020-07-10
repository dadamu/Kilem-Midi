const trackModel = require("../Models/trackModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    commit: asyncHandler(async (req, res) => {
        const { type, roomId } = req.body;
        switch (type) {
            case "add": {
                const track = await trackModel.trackAdd(req.body);
                res.json({ track });

                const io = req.app.get("io");
                io.of("/room" + roomId).to("editor").emit("addTrack", track);
                break;
            }
            case "commit": {
                const isValid = await trackModel.authorityCheck(req.body);
                if (!isValid) {
                    res.json({ error: "It's Not Your Locked Track" });
                    break;
                }
                const result = await trackModel.trackCommit(req.body);
                if (result instanceof Error) {
                    res.json({ error: result.message });
                    break;
                }
                res.json({ status: "success" });
                const io = req.app.get("io");
                io.of("/room" + roomId).to("editor").emit("commit", { track: result });
                break;
            }
        }
    }),
    pull: asyncHandler(async (req, res) => {
        const { roomId, trackId, version } = req.query;
        const result = await trackModel.versionPull(roomId, trackId, version);
        res.json(result);
    }),
    delete: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const result = await trackModel.trackDelete(req.body);
        if (result instanceof Error) {
            res.json({ error: result.message });
            return;
        }
        res.json({ status: "success" });
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("delete", { track: result });
    })
};