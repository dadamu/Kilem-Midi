const express = require("express");
const router = express();
const frontController = require("../controllers/frontController");

router.route("/editor/:id")
    .get(frontController.editor);
router.route("")
    .get(frontController.index);
router.route("/sign")
    .get(frontController.sign);


module.exports = router;