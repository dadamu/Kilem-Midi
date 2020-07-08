const express = require("express");
const router = express();
const midiController = require("../../Controllers/midiController");

router.route("/midi/saveFile")
    .post(midiController.save);

router.route("/midi/createRoom")
    .post(midiController.createRoom);

router.route("/midi/addUser")
    .post(midiController.addUser);

router.route("/midi/getFile")
    .get(midiController.getFile);

router.route("/midi/commit/:type")
    .post(midiController.commit);

module.exports = router;