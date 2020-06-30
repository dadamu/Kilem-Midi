const path = require('path');
const viewsPath = '../../views'
module.exports = { 
    midiEditer : (req, res) => {
        res.sendFile(path.join(__dirname, viewsPath, 'midi-editer.html'))
    } 
}