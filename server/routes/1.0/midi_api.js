const express = require('express');
const router = express();
const midiController = require('../../controllers/midiController');

router.route('/midi/save')
    .get(midiController.save);

router.route('/midi/create')
    .get(midiController.create);
    
module.exports = router;