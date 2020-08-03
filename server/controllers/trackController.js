const trackModel = require("../models/trackModel");
const asyncHandler = require("../../util/asyncHandler");
const trackDebug = require("debug")("app");

module.exports = {
    commit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { roomId } = req.body;
        const isValid = await trackModel.authorityCheck(id, req.body);
        if (!isValid) {
            res.json({ error: "lock failed" });
            return;
        }
        const track = await trackModel.commit(id, req.body);
        if (track instanceof Error) {
            res.json({ error: track.message });
            return;
        }
        trackDebug("Commit Track Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor").emit("commit", { track });
        res.json({ status: "success" });
    }),
    add: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const track = await trackModel.add(req.body);
        trackDebug("Add Track Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor").emit("addTrack", track);
        res.json({ status: "success" });
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
        trackDebug("Delete Track Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("deleteTrack", { track: result });
        res.json({ status: "success" });
    }),
    update: asyncHandler(async (req, res) => {
        const { type } = req.params;
        if (type === "instrument") {
            await instrumentSet(req, res);
        }
        else if (type === "lock") {
            await lockSet(req, res);
        }
        else if (type === "name") {
            await nameChange(req, res);
        }
    })
};

const lockSet = async (req, res) => {
    const { id: trackId } = req.params;
    const { roomId, userId } = req.body;
    const track = await trackModel.lockSet(trackId, userId);
    if (track instanceof Error) {
        res.json({ error: track.message });
        return;
    }
    const io = req.app.get("io");
    io.of("/room" + roomId).emit("lock", { track });
    res.json({ status: "success" });
};

const nameChange = async (req, res) => {
    const { id: trackId } = req.params;
    const { roomId } = req.body;
    const result = await trackModel.nameChange(trackId, req.body);
    if (result instanceof Error) {
        res.json({ error: result.message });
        return;
    }
    const io = req.app.get("io");
    io.of("/room" + roomId).emit("trackNameChange", {
        id: trackId,
        name: req.body.name
    });
    res.json({ status: "success" });
};

const instrumentSet = async (req, res) => {
    const { id: trackId } = req.params;
    const { roomId } = req.body;
    const track = await trackModel.instrumentSet(trackId, req.body);
    if (track instanceof Error) {
        res.json({ error: track.message });
        return;
    }
    res.json({ status: "success" });
    trackDebug("Change Track Instrument Success");
    const io = req.app.get("io");
    io.of("/room" + roomId).emit("instrumentSet", { track });
};