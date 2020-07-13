const fileModel = require("../Models/fileModel");
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
        res.status(200).json({ data: file });
    }),
    update: asyncHandler(async (req, res)=>{
        const { id } = req.params;
        const { roomId, userId, type } = req.body;
        const note = await fileModel.update(id, req.body);
        res.json({ status: "success" });

        const io = req.app.get("io");
        io.of("/room" + roomId).to("editor" + userId).emit(type, { trackId: id, note });
    })
};