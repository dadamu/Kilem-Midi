const express = require("express");
const router = express();
const frontController = require("../Controllers/frontController");

router.route("/midi-editor/:id")
    .get(frontController.midiEditor);


module.exports = router;