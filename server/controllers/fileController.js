const fileModel = require('../models/fileModel');
const asyncHandler = require('../../util/asyncHandler');
module.exports = {
    save: asyncHandler(async (req, res) => {
        await fileModel.saveFile(req.body, req.user);
        res.status(201).json({ status: 'success' });
    }),
    getFile: asyncHandler(async (req, res) => {
        const { roomId } = req.query;
        if (!roomId) {
            const err = new Error('Invalid input');
            err.status = 400;
            throw err;
        }
        const file = await fileModel.getFile(roomId, req.user);
        res.status(200).json({ data: file });
    }),
    update: asyncHandler(async (req, res) => {
        const { roomId, type } = req.params;
        await fileModel.update(roomId, type, req.body,  req.user);
        res.status(201).json({ status: 'success' });
        const io = req.app.get('io');
        if(type === 'filename'){
            io.of('/room' + roomId).to('editor').emit('filenameChange', { filename: req.body.filename });
        }
        else if(type === 'bpm'){
            io.of('/room' + roomId).to('editor').emit('bpmChange', { bpm: req.body.bpm });
        }
    })
};