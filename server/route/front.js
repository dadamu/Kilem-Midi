const express = require('express');
const router = express();
const frontController = require('../controller/frontController');

router.route('/midi-editor')
    .get(frontController.midiEditor);

module.exports = router;