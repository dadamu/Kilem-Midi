const express = require("express");
const router = express();
const roomController = require("../../Controllers/roomController");

router.route("/room")
    .post(roomController.create);

router.route("/room/user")
    .post(roomController.addUser);

module.exports = router;