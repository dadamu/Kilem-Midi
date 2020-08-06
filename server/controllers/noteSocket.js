const fileModel = require('../models/fileModel');
const noteDebug = require('debug')('app');
module.exports = {
    noteListen: (socket) => {
        socket.on('noteUpdate', async (noteInfo) => {
            noteDebug(noteInfo);
            const user = socket.kilemUser;
            const note = await fileModel.saveNote(noteInfo, user);
            
            socket.broadcast.to('editor' + user.id).emit(noteInfo.type, {
                trackId: noteInfo.trackId,
                note
            });
            noteDebug('Note Update');
        });
    }
};