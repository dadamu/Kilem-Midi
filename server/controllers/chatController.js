const asyncHandler = require("../../util/asyncHandler");
const chatModel = require("../models/chatModel");
module.exports = {
    init: asyncHandler(async (req, res) => {
        let { roomId, paging }  = req.query;
        paging = paging | 0 ;
        const result = await chatModel.get(roomId, paging);
        res.json(result);
    }),
    create: asyncHandler(async (req, res)=>{
        const { roomId } = req.body;
        const result = await chatModel.create(req.body);
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("chat", { chat: result });
        res.json({ status: "success"});
    })
};