const express = require("express");
const router = express();
const trackController = require("../../Controllers/trackController");
const fileController = require("../../Controllers/fileController");

router.route("/midi/file")
    .post(fileController.save);

router.route("/midi/file")
    .get(fileController.getFile);

router.route("/midi/track")
    .post(trackController.commit);

router.route("/midi/track")
    .get(trackController.pull);

router.route("/midi/track")
    .delete(trackController.delete);

module.exports = router;