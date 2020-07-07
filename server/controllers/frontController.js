const path = require("path");
const viewsPath = "../../views";
module.exports = { 
    midiEditor: (req, res) => {
        res.sendFile(path.join(__dirname, viewsPath, "midi-editor.html"));
    } 
};