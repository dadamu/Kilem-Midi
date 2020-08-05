const trackModel = require("../models/trackModel");
const asyncHandler = require("../../util/asyncHandler");
const trackDebug = require("debug")("app");

module.exports = {
    versionCommit: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { roomId } = req.body;
        const isValid = await trackModel.authorityCheck(id, req.body);
        if (!isValid) {
            res.json({ error: "lock failed" });
            return;
        }
        const track = await trackModel.commit(id, req.body);
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
    versionPull: asyncHandler(async (req, res) => {
        const { trackId, version } = req.query;
        const result = await trackModel.versionPull(trackId, version);
        res.json(result);
    }),
    delete: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const { id } = req.params;
        const result = await trackModel.delete(id, req.body);
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
    const io = req.app.get("io");
    io.of("/room" + roomId).emit("lock", { track });
    res.json({ status: "success" });
};

const nameChange = async (req, res) => {
    const { id: trackId } = req.params;
    const { roomId } = req.body;
    await trackModel.nameChange(trackId, req.body);
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
    res.json({ status: "success" });
    trackDebug("Change Track Instrument Success");
    const io = req.app.get("io");
    io.of("/room" + roomId).emit("instrumentSet", { track });
};