const express = require('express');
const router = express();
const midiController = require('../../controllers/midiController');

router.route('/midi/saveFile')
    .post(midiController.save);

router.route('/midi/createRoom')
    .post(midiController.createRoom);

router.route('/midi/addUser')
    .post(midiController.addUser);
    
module.exports = router;