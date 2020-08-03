const fileModel = require("../models/fileModel");
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
        if (file instanceof Error) {
            res.status(403).json({ error: file.message });
            return;
        }
        res.status(200).json({ data: file });
    }),
    update: asyncHandler(async (req, res) => {
        const { roomId, type } = req.params;
        const isUpdated = await fileModel.update(roomId, type, req.body);
        if (isUpdated instanceof Error) {
            res.status(403).json({ error: isUpdated.message });
            return;
        }
        res.status(201).json({ status: "success" });
        const io = req.app.get("io");
        if(type === "filename"){
            io.of("/room" + roomId).to("editor").emit("filenameChange", { filename: req.body.filename });
        }
        else if(type === "bpm"){
            io.of("/room" + roomId).to("editor").emit("bpmChange", { bpm: req.body.bpm });
        }
    })
};