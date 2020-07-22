const express = require("express");
const router = express();
const roomController = require("../../controllers/roomController");

router.route("/room")
    .post(roomController.create);

router.route("/room")
    .delete(roomController.delete);

router.route("/room/:type")
    .get(roomController.get);

router.route("/room/user")
    .post(roomController.addUser);
router.route("/room/user")
    .delete(roomController.deleteUser);

module.exports = router;