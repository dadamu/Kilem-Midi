const express = require("express");
const router = express();
const midiController = require("../../Controllers/midiController");

router.route("/midi/saveFile")
    .post(midiController.save);

router.route("/midi/getFile")
    .get(midiController.getFile);

router.route("/midi/commit")
    .post(midiController.commit);

module.exports = router;