const express = require('express');
const router = express();
const frontController = require('../controller/frontController');

router.route('/midi-editer')
    .get(frontController.midiEditer);

module.exports = router;