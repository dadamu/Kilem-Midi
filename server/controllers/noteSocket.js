const fileModel = require("../models/fileModel");
const noteDebug = require("debug")("app");
module.exports = {
    noteListen: (socket) => {
        socket.on("noteUpdate", async (noteInfo) => {
            noteDebug(noteInfo);
            const note = await fileModel.saveNote(noteInfo);
            socket.broadcast.to("editor" + noteInfo.userId).emit(noteInfo.type, {
                trackId: noteInfo.trackId,
                note
            });
            noteDebug("Note Update");
        });
    }
};