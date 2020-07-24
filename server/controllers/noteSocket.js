const fileModel = require("../models/fileModel");
const noteDebug = require("debug")("app");
module.exports = {
    noteListen: (socket) => {
        socket.on("noteUpdate", async(info) => {
            noteDebug(info);
            const note = await fileModel.update(info);
            socket.broadcast.to("editor" + info.userId).emit(info.type, { trackId: info.trackId, note });
            noteDebug("Note Update");
        });
    }
};