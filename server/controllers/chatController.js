const asyncHandler = require("../../util/asyncHandler");
const chatModel = require("../models/chatModel");
module.exports = {
    init: asyncHandler(async (req, res) => {
        let { roomId, paging }  = req.query;
        paging = paging | 0 ;
        const chats = await chatModel.get(roomId, paging);
        res.json(chats);
    }),
    create: asyncHandler(async (req, res)=>{
        const { roomId } = req.body;
        const chat = await chatModel.create(req.body);
        const io = req.app.get("io");
        io.of("/room" + roomId).emit("chat", { chat });
        res.json({ status: "success"});
    })
};