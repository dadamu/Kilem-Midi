const trackModel = require("../models/trackModel");
const asyncHandler = require("../../util/asyncHandler");
const trackDebug = require("debug")("app");

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
        trackDebug("Commit Track Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor").emit("commit", { track: result });
        return;
    }),
    add: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const track = await trackModel.add(req.body);
        res.json({ status: "success" });
        trackDebug("Add Track Success");
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
        const { id } = req.params;
        const result = await trackModel.delete(id, req.body);
        if (result instanceof Error) {
            res.json({ error: result.message });
            return;
        }
        res.json({ status: "success" });
        trackDebug("Delete Track Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("deleteTrack", { track: result });
    }),
    update: asyncHandler(async (req, res) => {
        const { id, type } = req.params;
        const { roomId } = req.body;
        let result;
        if (type === "lock") {
            result = await trackModel.lockSet(id, req.body);
        }
        else if (type === "name") {
            result = await trackModel.nameChange(id, req.body);
        }
        if (result instanceof Error) {
            res.json({ error: result.message });
            return;
        }
        res.json({ status: "success" });

        const io = req.app.get("io");
        if (type === "lock")
            io.of("/room" + roomId).emit("lock", { track: result });
        else if (type === "name") {
            io.of("/room" + roomId).emit("trackNameChange", {
                id,
                name: req.body.name
            });
        }
    }),
    instrumentSet: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { roomId } = req.body;
        const result = await trackModel.instrumentSet(id, req.body);
        if (result instanceof Error) {
            res.json({ error: result.message });
            return;
        }
        res.json({ status: "success" });
        trackDebug("Change Track Instrument Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("instrumentSet", { track: result });
    })
};