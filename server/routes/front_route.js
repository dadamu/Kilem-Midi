const express = require("express");
const router = express();
const frontController = require("../controllers/frontController");

router.route("/midi-editor/:id")
    .get(frontController.midiEditor);


module.exports = router;