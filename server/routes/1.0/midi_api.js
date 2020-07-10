const express = require("express");
const router = express();
const midiController = require("../../Controllers/midiController");

router.route("/midi/file")
    .post(midiController.save);

router.route("/midi/file")
    .get(midiController.getFile);

router.route("/midi/track")
    .post(midiController.commit);

router.route("/midi/track")
    .get(midiController.pull);

module.exports = router;