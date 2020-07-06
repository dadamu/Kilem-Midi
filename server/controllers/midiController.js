const midiModel = require("../Models/midiModel");
const asyncHandler = require("../../util/asyncHandler");
module.exports = {
    createRoom: asyncHandler(async (req, res) => {
        await midiModel.createRoom(req.body);
        res.send("Create");
    }),
    addUser: asyncHandler(async(req, res) => {
        await midiModel.addUser(req.body);
        res.json({ status: "success" });
    }),
    save: asyncHandler(async(req, res) => {
        await midiModel.saveFile(req.body);
        res.status(201).json({ status: "success" });
    }),
    get: asyncHandler(async(req, res) => {
        res.sned("Get");
    })
};