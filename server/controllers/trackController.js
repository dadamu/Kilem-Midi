const trackModel = require("../models/trackModel");
const asyncHandler = require("../../util/asyncHandler");
const appDebug = require("debug")("app");

module.exports = {
    versionCommit: asyncHandler(async (req, res) => {
        const { id: trackId } = req.params;
        const { roomId } = req.body;
        const isValid = await trackModel.authorityCheck(trackId, req.user);
        if (!isValid) {
            res.json({ error: "lock failed" });
            return;
        }
        const track = await trackModel.commit(trackId, req.body, req.user);
        appDebug("Commit Track Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor").emit("commit", { track });
        res.json({ status: "success" });
    }),
    add: asyncHandler(async (req, res) => {
        const { roomId } = req.body;
        const track = await trackModel.add(roomId, req.user);
        appDebug("Add Track Success");
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
        const { id: trackId } = req.params;
        const track = await trackModel.delete(trackId, req.user);
        appDebug("Delete Track Success");
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("deleteTrack", { track });
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
    const { roomId } = req.body;
    const track = await trackModel.lockSet(trackId, req.user);
    const io = req.app.get("io");
    io.of("/room" + roomId).emit("lock", { track });
    res.json({ status: "success" });
};

const nameChange = async (req, res) => {
    const { id: trackId } = req.params;
    const { roomId } = req.body;
    await trackModel.nameChange(trackId, req.body, req.user);
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
    const track = await trackModel.instrumentSet(trackId, req.body, req.user);
    res.json({ status: "success" });
    appDebug("Change Track Instrument Success");
    const io = req.app.get("io");
    io.of("/room" + roomId).emit("instrumentSet", { track });
};