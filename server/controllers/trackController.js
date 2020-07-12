const trackModel = require("../Models/trackModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    commit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { roomId } = req.body;
        const isValid = await trackModel.authorityCheck(id, req.body);
        if (!isValid) {
            res.json({ error: "It's Not Your Locked Track" });
            return;
        }
        const result = await trackModel.commit(id, req.body);
        if (result instanceof Error) {
            res.json({ error: result.message });
            return;
        }
        res.json({ status: "success" });
        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor").emit("commit", { track: result });
        return;
    }),
    add: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const track = await trackModel.add(req.body);
        res.json({ track });

        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor").emit("addTrack", track);
    }),
    pull: asyncHandler(async (req, res) => {
        const { trackId, version } = req.query;
        const result = await trackModel.versionPull(trackId, version);
        res.json(result);
    }),
    delete: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const result = await trackModel.delete(req.body);
        if (result instanceof Error) {
            res.json({ error: result.message });
            return;
        }
        res.json({ status: "success" });
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("delete", { track: result });
    }),
    lockSet: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { roomId } = req.body;
        const result = await trackModel.lockSet(id, req.body);
        if(result instanceof Error){
            res.json({error: result.message});
            return;
        }
        res.json({status: "success"});
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("lock", { track: result });
    })
};