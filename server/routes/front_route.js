const express = require("express");
const router = express();
const frontController = require("../Controllers/frontController");

router.route("/midi-editor")
    .get(frontController.midiEditor);

module.exports = router;