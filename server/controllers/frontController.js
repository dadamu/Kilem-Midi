const path = require("path");
const viewsPath = "../../views";
const roomModel = require("../models/roomModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    editor: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const isRoomExisted = await roomModel.hasRoom(id);
        if (!isRoomExisted) {
            res.sendFile(path.join(__dirname, viewsPath, "404.html"));
            return;
        }
        res.sendFile(path.join(__dirname, viewsPath, "editor.html"));
    }),
    welcome: asyncHandler(async (req, res) => {
        res.sendFile(path.join(__dirname, viewsPath, "welcome.html"));
    }),
    sign: asyncHandler(async (req, res) => {
        res.sendFile(path.join(__dirname, viewsPath, "sign.html"));
    }),
    room: asyncHandler(async (req, res) => {
        res.sendFile(path.join(__dirname, viewsPath, "room.html"));
    })
};