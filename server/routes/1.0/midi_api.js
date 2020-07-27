const express = require("express");
const router = express();
const trackController = require("../../controllers/trackController");
const fileController = require("../../controllers/fileController");

router.route("/midi/file")
    .post(fileController.save);

router.route("/midi/file")
    .get(fileController.getFile);

router.route("/midi/file/:roomId/:type")
    .patch(fileController.update);

router.route("/midi/track")
    .post(trackController.add);

router.route("/midi/track/:id")
    .put(trackController.commit);

router.route("/midi/track/:id/:type")
    .patch(trackController.update);

router.route("/midi/track")
    .get(trackController.pull);

router.route("/midi/track/:id")
    .delete(trackController.delete);

module.exports = router;