const express = require("express");
const router = express();
const frontController = require("../controllers/frontController");

router.route("/editor/:id")
    .get(frontController.editor);

router.route("")
    .get(frontController.welcome);

router.route("/sign")
    .get(frontController.sign);

router.route("/room")
    .get(frontController.room);

router.route("/profile")
    .get(frontController.profile);

module.exports = router;