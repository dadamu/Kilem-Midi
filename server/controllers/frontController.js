const path = require("path");
const viewsPath = "../../views";
const midiModel = require("../Models/midiModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    midiEditor: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const isRoomExisted = await midiModel.hasRoom(id);
        if(!isRoomExisted){
            res.sendFile(path.join(__dirname, viewsPath, "404.html"));
            return;
        }
        res.sendFile(path.join(__dirname, viewsPath, "midi-editor.html"));
    })
};