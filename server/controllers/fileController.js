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
        const result = await fileModel.getFile(roomId, userId);
        if(result instanceof Error){
            res.status(403).json({error: result.message});
            return;
        }
        res.status(200).json({ data: result });
    }),
    update: asyncHandler(async (req, res) => {
        const { roomId, type } = req.params;
        const result = await fileModel.update(roomId, type, req.body);
        if(result instanceof Error){
            res.status(403).json({error: result.message});
            return;
        }
        res.status(201).json({ status: "success" });
        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor").emit("filenameChange", { filename: req.body.filename});
    })
};