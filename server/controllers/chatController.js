const asyncHandler = require("../../util/asyncHandler");
const chatModel = require("../Models/chatModel");
module.exports = {
    init: asyncHandler(async (req, res) => {
        res.json({result: ""});
    }),
    create: asyncHandler(async (req, res)=>{
        const { roomId } = req.body;
        const result = await chatModel.create(req.body);
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("chat", { chat: result });
        res.json({result: req.body});
    })
};