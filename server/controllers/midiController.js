const midiModel = require("../Models/midiModel");
module.exports = {
    create : async(req, res)=>{
        const { name } = req.query;
        midiModel.create(name);
        res.send("Create");
    },
    save : (req, res)=>{
        res.send("Save");
    }
};